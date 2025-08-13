# File-Based Database Guide

This guide explains the file-based database implementation used in the release process chatbot, which replaces SQLite to comply with corporate policies.

## 🗄️ Overview

The file-based database uses JSON files to store data instead of a traditional database system. This approach:

- ✅ **No external dependencies** - Uses only Node.js built-in modules
- ✅ **Corporate policy compliant** - No SQLite or other restricted databases
- ✅ **Simple and portable** - Data stored in human-readable JSON files
- ✅ **Backup friendly** - Easy to backup and restore
- ✅ **Version control ready** - Can be tracked in git (if needed)

## 📁 File Structure

```
data/
├── releases.json          # Release records
├── conversations.json     # Conversation records
├── release_steps.json     # Release step records
├── release_logs.json      # Release log records
└── backup/               # Automatic backups
    └── YYYY-MM-DD/
        ├── releases.json
        ├── conversations.json
        ├── release_steps.json
        └── release_logs.json
```

## 🔧 Implementation Details

### **Data Storage**
- Each entity type has its own JSON file
- Data is stored as arrays of objects
- Automatic UUID generation for unique IDs
- Timestamps for created/updated tracking

### **File Operations**
- Asynchronous file I/O using `fs.promises`
- Automatic file creation if not exists
- Error handling and logging
- Atomic write operations

### **Backward Compatibility**
- Maintains Sequelize-like API interface
- Existing code continues to work without changes
- Gradual migration path available

## 🚀 Usage

### **Basic Operations**

```javascript
const { fileDatabase } = require('./src/models/database');

// Create a release
const release = await fileDatabase.createRelease({
  version: '2.1.0',
  status: 'pending',
  environment: 'development',
  applications: ['app1', 'app2']
});

// Find a release
const foundRelease = await fileDatabase.findReleaseById(release.id);

// Update a release
const updatedRelease = await fileDatabase.updateRelease(release.id, {
  status: 'in_progress'
});

// Get all releases
const allReleases = await fileDatabase.findAllReleases();
```

### **Advanced Operations**

```javascript
// Get release with related data
const releaseWithSteps = await fileDatabase.getReleaseWithSteps(releaseId);

// Get conversation with releases
const conversationWithReleases = await fileDatabase.getConversationWithReleases(conversationId);

// Create backup
await fileDatabase.backup();

// Get database statistics
const stats = await fileDatabase.getStats();
```

## 🧪 Testing

Test the file-based database functionality:

```bash
npm run test:database
```

This will test:
- Database initialization
- CRUD operations for all entities
- Utility methods
- Backup functionality
- Statistics generation

## 📊 Performance Considerations

### **Advantages**
- **Fast startup** - No database connection overhead
- **Simple queries** - Direct file access
- **No network latency** - Local file system access
- **Easy debugging** - Human-readable data format

### **Limitations**
- **No concurrent writes** - Single-threaded file access
- **No complex queries** - Basic filtering only
- **Memory usage** - Entire datasets loaded into memory
- **File size growth** - No automatic cleanup

### **Best Practices**
1. **Regular backups** - Use the built-in backup functionality
2. **Data cleanup** - Periodically remove old records
3. **Error handling** - Always handle file operation errors
4. **Monitoring** - Watch file sizes and performance

## 🔄 Migration from SQLite

### **Automatic Migration**
The system automatically handles migration from SQLite:

1. **Backward compatibility** - Existing Sequelize API still works
2. **No code changes** - Application code remains unchanged
3. **Data preservation** - Existing data can be migrated if needed

### **Manual Migration (if needed)**
If you have existing SQLite data to migrate:

```javascript
// Export from SQLite
const sqliteData = await sqliteDatabase.findAll();

// Import to file database
for (const record of sqliteData) {
  await fileDatabase.createRelease(record);
}
```

## 🛠️ Configuration

### **Environment Variables**
No special configuration required. The database automatically:

- Creates `data/` directory if it doesn't exist
- Initializes JSON files with empty arrays
- Handles file permissions automatically

### **Customization**
You can customize the data directory:

```javascript
// In fileDatabase.js
constructor() {
  this.dataDir = process.env.DATA_DIR || path.join(__dirname, '../../data');
  // ...
}
```

## 🔒 Security Considerations

### **File Permissions**
- Ensure `data/` directory has appropriate permissions
- Restrict access to database files
- Use secure file system permissions

### **Data Protection**
- Regular backups to secure location
- Encrypt sensitive data if needed
- Monitor file access logs

### **Corporate Compliance**
- No external database dependencies
- Data stays within corporate network
- Audit trail through file timestamps

## 📈 Scaling Considerations

### **For Small to Medium Usage**
- File-based database is sufficient
- Good performance for < 10,000 records
- Easy to manage and backup

### **For Large Scale Usage**
Consider migrating to a proper database:
- PostgreSQL for production
- MongoDB for document storage
- Redis for caching

## 🚨 Troubleshooting

### **Common Issues**

#### File Permission Errors
```
Error: EACCES: permission denied
```
**Solution:**
- Check file permissions: `ls -la data/`
- Fix permissions: `chmod 755 data/`
- Ensure user has write access

#### Disk Space Issues
```
Error: ENOSPC: no space left on device
```
**Solution:**
- Check disk space: `df -h`
- Clean up old backups: `rm -rf data/backup/old-dates`
- Monitor file sizes regularly

#### Data Corruption
```
Error: Unexpected token in JSON
```
**Solution:**
- Restore from backup: `cp data/backup/YYYY-MM-DD/*.json data/`
- Validate JSON files: `node -e "JSON.parse(require('fs').readFileSync('data/releases.json'))"`
- Check for concurrent writes

### **Debug Mode**
Enable debug logging:

```env
LOG_LEVEL=debug
```

### **Manual Recovery**
If automatic recovery fails:

```bash
# Check file integrity
node -e "console.log(JSON.parse(require('fs').readFileSync('data/releases.json')).length)"

# Restore from backup
cp data/backup/$(date +%Y-%m-%d)/*.json data/

# Reinitialize database
npm run db:init
```

## 📞 Support

For issues with:
- **File Database**: Check this guide and error logs
- **Performance**: Monitor file sizes and access patterns
- **Migration**: Contact development team
- **Backup/Restore**: Use built-in backup functionality

## 🎯 Best Practices

1. **Regular Backups**: Schedule automatic backups
2. **Monitor Growth**: Watch file sizes and performance
3. **Error Handling**: Always handle file operation errors
4. **Data Cleanup**: Remove old records periodically
5. **Security**: Secure file permissions and access
6. **Testing**: Run database tests regularly
7. **Documentation**: Keep migration and backup procedures updated
