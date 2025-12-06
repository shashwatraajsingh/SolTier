# Production Deployment Guide

This guide covers deploying ReachPay to production environments.

## Prerequisites

- Docker and Docker Compose
- Solana CLI configured
- Production Solana RPC endpoint (recommended: use a private RPC provider)
- SSL/TLS certificates for HTTPS
- Monitoring and alerting setup

## Pre-Deployment Checklist

### Security
- [ ] Generate dedicated production keypairs (never reuse testnet keys)
- [ ] Store keypairs in secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)
- [ ] Configure firewalls and security groups
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Set strong CORS policies
- [ ] Configure rate limiting appropriately
- [ ] Review and harden all environment variables

### Infrastructure
- [ ] Set up load balancer (if running multiple instances)
- [ ] Configure auto-scaling policies
- [ ] Set up log aggregation (ELK, CloudWatch, etc.)
- [ ] Configure monitoring and alerting (Prometheus, Grafana, Datadog)
- [ ] Set up backup and disaster recovery procedures
- [ ] Configure health checks and readiness probes

### Application
- [ ] Update PROGRAM_ID to production contract
- [ ] Verify all environment variables
- [ ] Test deployment in staging environment
- [ ] Run security audit on smart contract
- [ ] Perform load testing
- [ ] Set up CI/CD pipeline

## Deployment Steps

### 1. Environment Setup

Create production .env file:

```bash
cp backend/.env.example backend/.env
```

Edit .env with production values:

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com
SOLANA_NETWORK=mainnet
ORACLE_KEYPAIR_PATH=/secure/path/to/keypair.json
PROGRAM_ID=YourProductionProgramID
MAX_RETRIES=3
RETRY_DELAY=1000
MONITORING_INTERVAL=60000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=warn
```

### 2. Build and Deploy Contract

```bash
# Build program
cargo build-sbf

# Deploy to mainnet (after thorough testing)
solana config set --url https://api.mainnet-beta.solana.com
solana program deploy target/deploy/reachpay_solana.so

# Save program ID
PROGRAM_ID=$(solana address -k target/deploy/reachpay_solana-keypair.json)
echo "PROGRAM_ID=$PROGRAM_ID" >> backend/.env
```

### 3. Docker Deployment

```bash
# Build image
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Check health
curl http://localhost:3001/health
```

### 4. Kubernetes Deployment (Optional)

Create Kubernetes manifests:

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: reachpay-oracle
spec:
  replicas: 3
  selector:
    matchLabels:
      app: reachpay-oracle
  template:
    metadata:
      labels:
        app: reachpay-oracle
    spec:
      containers:
      - name: oracle
        image: reachpay-oracle:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: SOLANA_NETWORK
          value: "mainnet"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

Deploy:

```bash
kubectl apply -f k8s/
kubectl get pods
kubectl logs -f deployment/reachpay-oracle
```

## Monitoring and Observability

### Metrics to Monitor

- API Request rate and latency
- Error rates by endpoint
- Oracle update frequency
- Solana RPC connection status
- Campaign processing metrics
- Payout success/failure rates
- Resource usage (CPU, memory, network)

### Logging

All logs are output in JSON format for easy parsing:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Metrics updated",
  "campaign_id": "...",
  "transaction": "..."
}
```

Configure log aggregation:

```bash
# Ship logs to external service
docker-compose logs -f | your-log-shipper
```

### Health Checks

- GET /health - Basic health check
- GET /ready - Readiness check (validates connections)

Both should return 200 OK in healthy state.

## Scaling

### Horizontal Scaling

Run multiple oracle instances with:
- Shared RPC endpoint (use rate-limited private RPC)
- Distributed locking for campaign monitoring
- Load balancer for API requests

### Vertical Scaling

Increase resources if needed:
- 2+ CPU cores recommended
- 4GB+ RAM recommended
- SSD storage for logs

## Security Hardening

### Network

- Use private VPC
- Restrict inbound traffic to necessary ports only
- Use HTTPS/TLS for all external communication
- Configure DDoS protection

### Application

- Keep dependencies updated (npm audit fix)
- Use environment-specific configurations
- Implement request signing for sensitive operations
- Regular security audits

### Solana

- Use dedicated RPC endpoints (not public)
- Monitor for unusual transaction patterns
- Implement multi-sig for critical operations
- Regular key rotation procedures

## Backup and Recovery

### Keypairs

- Store encrypted backups in multiple locations
- Use hardware security modules (HSM) for production keys
- Document recovery procedures

### Application State

- Regular database backups (if using)
- Configuration backups
- Disaster recovery runbooks

## Incident Response

### Monitoring Alerts

Set up alerts for:
- High error rates (> 5%)
- API latency (> 1s p99)
- Failed oracle updates
- Low oracle wallet balance
- Health check failures

### Runbooks

Create runbooks for:
- Oracle service restart
- Emergency contract upgrade
- Key compromise response
- RPC endpoint failover

## Performance Optimization

### Caching

Implement caching for:
- Campaign status queries
- Account lookups
- RPC responses

### Rate Limiting

Configure appropriate limits based on usage:
- Development: 10 req/min
- Production: 100 req/min
- Enterprise: Custom limits

### Connection Pooling

Use connection pooling for:
- Solana RPC connections
- Database connections (if applicable)

## Cost Optimization

### Solana Costs

- Monitor transaction fees
- Batch operations where possible
- Use priority fees strategically

### Infrastructure

- Right-size compute resources
- Use spot instances for non-critical workloads
- Configure auto-scaling based on metrics

## Maintenance

### Regular Tasks

- Weekly dependency updates
- Monthly security patches
- Quarterly security audits
- Regular key rotation

### Upgrade Procedures

```bash
# 1. Test in staging
# 2. Create backup
# 3. Deploy new version
docker-compose pull
docker-compose up -d
# 4. Monitor for issues
# 5. Rollback if needed
docker-compose down
docker-compose up -d --force-recreate
```

## Support and Troubleshooting

### Common Issues

1. Connection timeouts
   - Check RPC endpoint status
   - Verify network connectivity
   - Review rate limits

2. Failed transactions
   - Check oracle wallet balance
   - Verify program deployment
   - Review transaction logs

3. High latency
   - Scale horizontally
   - Optimize queries
   - Use faster RPC endpoint

### Getting Help

- Check logs: docker-compose logs -f
- Review metrics: /health and /ready endpoints
- Consult documentation
- Contact support team

## Rollback Procedures

If deployment fails:

```bash
# Stop current deployment
docker-compose down

# Revert to previous version
git checkout <previous-tag>

# Rebuild and redeploy
docker-compose build
docker-compose up -d

# Verify health
curl http://localhost:3001/health
```

## Post-Deployment Verification

After deployment, verify:

```bash
# Health check
curl https://api.yourdomain.com/health

# Readiness check
curl https://api.yourdomain.com/ready

# Test campaign status
curl https://api.yourdomain.com/api/campaign/{CAMPAIGN_ID}/status

# Monitor logs
docker-compose logs -f --tail=100

# Check metrics
# (use your monitoring dashboard)
```

## Compliance and Auditing

### Logging Requirements

- All API requests logged
- All oracle updates tracked
- Failed transactions recorded
- Audit trail maintained

### Data Retention

- Logs: 90 days minimum
- Transactions: Permanent (on-chain)
- Metrics: 1 year

## Production Checklist

Final verification before going live:

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Load testing successful
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Backup procedures tested
- [ ] Disaster recovery plan documented
- [ ] Team trained on operations
- [ ] Runbooks created
- [ ] Documentation updated

---

For questions or issues, refer to the main documentation or contact the development team.
