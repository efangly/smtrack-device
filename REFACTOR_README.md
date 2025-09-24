# SMTrack Device Service - Refactored

SMTrack Device Service ที่ได้รับการปรับปรุงด้วย JSON Logging และ Error Handling ที่ดีขึ้น สำหรับการส่ง logs ไปยัง Grafana Loki

## การปรับปรุงหลัก

### 1. JSON Logger System
- **Location**: `src/common/logger/json.logger.ts`
- **Features**:
  - Log เฉพาะ `warn` และ `error` levels
  - ไม่ log HTTP requests ตามปกติ
  - Output เป็น JSON format สำหรับ Grafana Loki
  - รวม metadata เช่น service name, environment, timestamps

### 2. Enhanced Error Handling
- **Global Exception Filter**: ปรับปรุง `AllExceptionsFilter` ให้ใช้ JSON Logger
- **Service Level**: เพิ่ม try-catch blocks พร้อม detailed error logging
- **Controller Level**: ปรับปรุง error handling ใน message queue consumers

### 3. Improved Validation
- **DTOs**: เพิ่ม validation messages และ constraints ที่ชัดเจน
- **Environment Config**: สร้าง validation สำหรับ environment variables
- **Type Safety**: ปรับปรุง type safety ทั่วทั้งระบบ

### 4. Configuration Management
- **Environment Validation**: `src/common/config/`
- **Type-safe Configuration**: ใช้ class-validator สำหรับ env vars
- **Global Configuration**: ตั้งค่า ConfigModule เป็น global

## JSON Log Structure

```json
{
  "timestamp": "2025-09-22T10:30:00.000Z",
  "level": "error",
  "message": "Failed to create device",
  "context": "DeviceService.create",
  "service": "smtrack-device-service",
  "environment": "production",
  "metadata": {
    "deviceId": "device-123",
    "userId": "user-456"
  },
  "trace": "Error stack trace..."
}
```

## การติดตั้งและใช้งาน

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smtrack"

# Message Queue
RABBITMQ="amqp://user:password@localhost:5672"

# Application
PORT=8080
NODE_ENV=production
DEVICE_SECRET="your-device-secret"

# External Services
LOG_URL="http://log-service:3000"
UPLOAD_PATH="http://upload-service:3000"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional
```

### การรัน Application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Grafana Loki Integration

### Log Queries
```logql
# ดู error logs ทั้งหมด
{service="smtrack-device-service"} |= "error"

# ดู warnings เฉพาะ context
{service="smtrack-device-service"} |= "warn" | json | context="DeviceService.create"

# ดู errors ที่เกี่ยวกับ device specific
{service="smtrack-device-service"} |= "error" | json | metadata_deviceId="device-123"
```

### Alerting Rules ที่แนะนำ
```yaml
# High error rate
- alert: HighErrorRate
  expr: rate({service="smtrack-device-service"} |= "error"[5m]) > 0.1
  for: 2m
  
# Database connection issues
- alert: DatabaseErrors
  expr: count_over_time({service="smtrack-device-service"} |= "Prisma" |= "error"[1m]) > 0
```

## Architecture Improvements

### Error Handling Flow
1. **Controller Level**: Basic error catching และ logging
2. **Service Level**: Business logic errors พร้อม context
3. **Global Filter**: จัดการ unhandled exceptions
4. **JSON Logger**: Format และส่ง logs ไปยัง stdout

### Validation Flow
1. **Request Validation**: DTO validation ที่ controller
2. **Environment Validation**: ตรวจสอบ config ตอน startup
3. **Business Validation**: ตรวจสอบ business rules ที่ service

### Logging Strategy
- **Errors**: ทุก errors พร้อม stack trace และ metadata
- **Warnings**: Business warnings และ unexpected conditions
- **No HTTP Logs**: ไม่ log HTTP requests เพื่อลด noise
- **Structured Data**: ใช้ JSON format เพื่อ easy parsing

## Security Considerations

### Sensitive Data
- ไม่ log passwords หรือ tokens ใน metadata
- Sanitize error messages สำหรับ production
- ใช้ environment-specific logging levels

### Error Exposure
- Development: แสดง stack traces
- Production: ซ่อน internal details จาก API responses
- Logs: เก็บ full error details สำหรับ debugging

## Performance Optimizations

### Logging Performance
- Async logging operations
- Minimal serialization overhead
- Structured data ลด parsing time

### Error Handling Performance
- Fast error paths
- Minimal try-catch nesting
- Efficient error classification

## Monitoring Dashboard

### Key Metrics
- Error rate by service method
- Warning trends over time
- Database operation failures
- Message queue processing errors

### Recommended Grafana Panels
1. **Error Rate Timeline**: Rate of errors over time
2. **Top Error Contexts**: Most error-prone operations
3. **Warning Frequency**: Business logic warnings
4. **Error Distribution**: Errors by HTTP status code

## Troubleshooting

### Common Issues

#### High Error Rate
```bash
# Check specific error patterns
grep "Failed to" logs.json | jq '.metadata'

# Analyze error contexts
grep "DeviceService" logs.json | jq '.context' | sort | uniq -c
```

#### Database Connection Issues
```bash
# Check Prisma errors
grep "Prisma" logs.json | jq '.message'
```

#### Message Queue Problems
```bash
# Check RabbitMQ consumer errors
grep "ConsumerController" logs.json | jq '.'
```

## Development Guidelines

### Adding New Error Logging
```typescript
// In Services
try {
  // business logic
} catch (error) {
  this.logger.logError(
    'Descriptive error message',
    error instanceof Error ? error : new Error(String(error)),
    'ServiceName.methodName',
    { relevant: 'metadata' }
  );
  throw error; // Re-throw if needed
}

// For Warnings
this.logger.logWarning(
  'Warning message',
  'ServiceName.methodName',
  { context: 'data' }
);
```

### Best Practices
1. **Consistent Context Naming**: Use `ClassName.methodName` format
2. **Meaningful Messages**: Describe what failed, not just "error occurred"
3. **Relevant Metadata**: Include IDs, user context, but not sensitive data
4. **Error Re-throwing**: Re-throw errors when caller needs to handle them
5. **Structured Logging**: Use metadata object instead of string interpolation

---

## Migration Notes

### Breaking Changes
- Global exception filter now logs differently
- Some log levels removed (debug, verbose)
- Environment validation required

### Compatibility
- API endpoints remain unchanged
- Message queue interfaces preserved
- Database schema unchanged

พัฒนาโดยทีม SMTrack - เพื่อระบบ monitoring และ logging ที่ดีขึ้น