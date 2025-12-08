export const IDL = {
    "address": "11111111111111111111111111111111",
    "metadata": {
        "name": "soltier_solana",
        "version": "0.1.0",
        "spec": "0.1.0"
    },
    "instructions": [
        {
            "name": "create_campaign",
            "discriminator": [181, 157, 89, 67, 143, 182, 52, 132],
            "accounts": [
                { "name": "campaign", "writable": true, "signer": false },
                { "name": "escrow_token_account", "writable": true, "signer": false },
                { "name": "brand", "writable": true, "signer": true },
                { "name": "brand_token_account", "writable": true, "signer": false },
                { "name": "mint", "writable": false, "signer": false },
                { "name": "token_program", "writable": false, "signer": false },
                { "name": "system_program", "writable": false, "signer": false },
                { "name": "rent", "writable": false, "signer": false }
            ],
            "args": [
                { "name": "campaign_id", "type": "pubkey" },
                { "name": "cpm", "type": "u64" },
                { "name": "like_weight", "type": "u64" },
                { "name": "max_budget", "type": "u64" },
                { "name": "creator", "type": "pubkey" },
                { "name": "start_time", "type": "i64" },
                { "name": "end_time", "type": "i64" }
            ]
        },
        {
            "name": "accept_campaign",
            "discriminator": [89, 156, 217, 107, 214, 232, 156, 203],
            "accounts": [
                { "name": "campaign", "writable": true, "signer": false },
                { "name": "creator", "writable": false, "signer": true }
            ],
            "args": []
        }
    ],
    "accounts": [
        {
            "name": "Campaign",
            "discriminator": [50, 40, 49, 11, 157, 220, 229, 192],
            "type": {
                "kind": "struct",
                "fields": [
                    { "name": "campaign_id", "type": "pubkey" },
                    { "name": "brand", "type": "pubkey" },
                    { "name": "creator", "type": "pubkey" },
                    { "name": "cpm", "type": "u64" },
                    { "name": "like_weight", "type": "u64" },
                    { "name": "max_budget", "type": "u64" },
                    { "name": "escrow_balance", "type": "u64" },
                    { "name": "views", "type": "u64" },
                    { "name": "likes", "type": "u64" },
                    { "name": "start_time", "type": "i64" },
                    { "name": "end_time", "type": "i64" },
                    { "name": "is_active", "type": "bool" },
                    { "name": "total_paid", "type": "u64" }
                ]
            }
        }
    ]
};
