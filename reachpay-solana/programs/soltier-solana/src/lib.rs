use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("11111111111111111111111111111111");

#[program]
pub mod soltier_solana {
    use super::*;

    /// Brand creates a new campaign and deposits USDC into escrow
    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        campaign_id: Pubkey,
        cpm: u64,
        like_weight: u64,
        max_budget: u64,
        creator: Pubkey,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        
        require!(cpm > 0, ErrorCode::InvalidCPM);
        require!(max_budget > 0, ErrorCode::InvalidBudget);
        require!(end_time > start_time, ErrorCode::InvalidTimeRange);
        require!(like_weight > 0, ErrorCode::InvalidLikeWeight);

        campaign.campaign_id = campaign_id;
        campaign.brand = ctx.accounts.brand.key();
        campaign.creator = creator;
        campaign.cpm = cpm;
        campaign.like_weight = like_weight;
        campaign.max_budget = max_budget;
        campaign.escrow_balance = 0;
        campaign.views = 0;
        campaign.likes = 0;
        campaign.start_time = start_time;
        campaign.end_time = end_time;
        campaign.is_active = false;
        campaign.total_paid = 0;

        // Transfer funds from brand to escrow
        let cpi_accounts = Transfer {
            from: ctx.accounts.brand_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.brand.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, max_budget)?;

        campaign.escrow_balance = max_budget;

        msg!("Campaign created: {}", campaign_id);
        msg!("CPM: {}, Max Budget: {}, Like Weight: {}", cpm, max_budget, like_weight);

        Ok(())
    }

    /// Creator accepts the campaign
    pub fn accept_campaign(ctx: Context<AcceptCampaign>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        
        require!(campaign.creator == ctx.accounts.creator.key(), ErrorCode::UnauthorizedCreator);
        require!(!campaign.is_active, ErrorCode::CampaignAlreadyActive);
        require!(campaign.escrow_balance > 0, ErrorCode::NoFundsInEscrow);

        campaign.is_active = true;

        msg!("Campaign {} accepted by creator", campaign.campaign_id);

        Ok(())
    }

    /// Oracle updates views and likes metrics
    pub fn update_metrics(
        ctx: Context<UpdateMetrics>,
        new_views: u64,
        new_likes: u64,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        
        require!(campaign.is_active, ErrorCode::CampaignNotActive);
        
        // Ensure metrics only increase (monotonic)
        require!(new_views >= campaign.views, ErrorCode::MetricsCannotDecrease);
        require!(new_likes >= campaign.likes, ErrorCode::MetricsCannotDecrease);

        campaign.views = new_views;
        campaign.likes = new_likes;

        msg!("Metrics updated - Views: {}, Likes: {}", new_views, new_likes);

        Ok(())
    }

    /// Settle payout based on current metrics
    pub fn settle_payout(ctx: Context<SettlePayout>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        
        require!(campaign.is_active, ErrorCode::CampaignNotActive);

        // Calculate effective views and payout
        let effective_views = campaign
            .views
            .checked_add(campaign.likes.checked_mul(campaign.like_weight).unwrap())
            .unwrap();

        let total_due = (effective_views / 1000)
            .checked_mul(campaign.cpm)
            .unwrap();

        let payout_amount = total_due.saturating_sub(campaign.total_paid);

        // Check if we have enough in escrow
        let actual_payout = std::cmp::min(payout_amount, campaign.escrow_balance);

        if actual_payout == 0 {
            msg!("No payout due");
            return Ok(());
        }

        // Transfer payout from escrow to creator
        let campaign_id = campaign.campaign_id.to_bytes();
        let bump = ctx.bumps.escrow_token_account;
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"escrow",
            campaign_id.as_ref(),
            &[bump],
        ]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.creator_token_account.to_account_info(),
            authority: ctx.accounts.escrow_token_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        token::transfer(cpi_ctx, actual_payout)?;

        campaign.escrow_balance = campaign.escrow_balance.saturating_sub(actual_payout);
        campaign.total_paid = campaign.total_paid.checked_add(actual_payout).unwrap();

        // Deactivate campaign if budget exhausted or time expired
        let clock = Clock::get()?;
        if campaign.escrow_balance == 0 || clock.unix_timestamp > campaign.end_time {
            campaign.is_active = false;
            msg!("Campaign deactivated");
        }

        msg!("Payout settled: {} lamports", actual_payout);
        msg!("Effective views: {}, Total paid: {}", effective_views, campaign.total_paid);

        Ok(())
    }

    /// Close campaign and refund remaining funds to brand
    pub fn close_campaign(ctx: Context<CloseCampaign>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        
        require!(campaign.brand == ctx.accounts.brand.key(), ErrorCode::UnauthorizedBrand);

        let remaining_balance = campaign.escrow_balance;

        if remaining_balance > 0 {
            // Transfer remaining funds from escrow to brand
            let campaign_id = campaign.campaign_id.to_bytes();
            let bump = ctx.bumps.escrow_token_account;
            let signer_seeds: &[&[&[u8]]] = &[&[
                b"escrow",
                campaign_id.as_ref(),
                &[bump],
            ]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.brand_token_account.to_account_info(),
                authority: ctx.accounts.escrow_token_account.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
            token::transfer(cpi_ctx, remaining_balance)?;

            campaign.escrow_balance = 0;
        }

        campaign.is_active = false;

        msg!("Campaign closed, refunded: {} lamports", remaining_balance);

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(campaign_id: Pubkey)]
pub struct CreateCampaign<'info> {
    #[account(
        init,
        payer = brand,
        space = 8 + Campaign::INIT_SPACE,
        seeds = [b"campaign", campaign_id.as_ref()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,
    
    #[account(
        init,
        payer = brand,
        seeds = [b"escrow", campaign_id.as_ref()],
        bump,
        token::mint = mint,
        token::authority = escrow_token_account
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub brand: Signer<'info>,
    
    #[account(mut)]
    pub brand_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: Mint account
    pub mint: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AcceptCampaign<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    
    pub creator: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateMetrics<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    
    pub oracle: Signer<'info>,
}

#[derive(Accounts)]
pub struct SettlePayout<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    
    #[account(
        mut,
        seeds = [b"escrow", campaign.campaign_id.as_ref()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CloseCampaign<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    
    #[account(
        mut,
        seeds = [b"escrow", campaign.campaign_id.as_ref()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub brand_token_account: Account<'info, TokenAccount>,
    
    pub brand: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct Campaign {
    pub campaign_id: Pubkey,      // 32
    pub brand: Pubkey,             // 32
    pub creator: Pubkey,           // 32
    pub cpm: u64,                  // 8 (USDC per 1,000 views)
    pub like_weight: u64,          // 8 (multiplier for likes)
    pub max_budget: u64,           // 8
    pub escrow_balance: u64,       // 8
    pub views: u64,                // 8
    pub likes: u64,                // 8
    pub start_time: i64,           // 8
    pub end_time: i64,             // 8
    pub is_active: bool,           // 1
    pub total_paid: u64,           // 8
}

#[error_code]
pub enum ErrorCode {
    #[msg("CPM must be greater than 0")]
    InvalidCPM,
    #[msg("Budget must be greater than 0")]
    InvalidBudget,
    #[msg("End time must be after start time")]
    InvalidTimeRange,
    #[msg("Like weight must be greater than 0")]
    InvalidLikeWeight,
    #[msg("Only the assigned creator can accept this campaign")]
    UnauthorizedCreator,
    #[msg("Campaign is already active")]
    CampaignAlreadyActive,
    #[msg("No funds in escrow")]
    NoFundsInEscrow,
    #[msg("Campaign is not active")]
    CampaignNotActive,
    #[msg("Metrics cannot decrease")]
    MetricsCannotDecrease,
    #[msg("Only brand can close campaign")]
    UnauthorizedBrand,
}
