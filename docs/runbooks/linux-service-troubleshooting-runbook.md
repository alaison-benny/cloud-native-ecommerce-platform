# Linux Service Troubleshooting Runbook

## Purpose

This runbook explains basic Linux service troubleshooting steps used in production support and cloud operations.

## Common Issues

- Service not starting
- Port already in use
- Disk full
- High memory usage
- High CPU usage
- Permission issue
- Application not reachable
- NGINX failure

## Step 1: Check Service Status

```bash
systemctl status <service-name>
```
Example:
```bash
systemctl status nginx
```
## Step 2: Check Service Logs
```bash
journalctl -u <service-name>
journalctl -u <service-name> -f
```
Example:
```bash
journalctl -u nginx -f
```
## Step 3: Check Listening Ports
```bash
ss -tulnp
netstat -tulnp
```
## Step 4: Check Disk Space
```bash
df -h
du -sh *
```
## Step 5: Check Memory
```bash
free -m
top
htop
```
## Step 6: Check CPU Load
```bash
top
uptime
```
## Step 7: Check Application Health
```bash
curl -I http://localhost
curl http://localhost/health
```
## Step 8: Restart Service
```bash
sudo systemctl restart <service-name>
sudo systemctl status <service-name>
```
## Step 9: Enable Service On Boot
```bash
sudo systemctl enable <service-name>
```
## Final Validation
- Service is active and running
- Port is listening
- Application endpoint is reachable
- Logs do not show repeated errors
