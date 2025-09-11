# Website Deletion Guide

## Overview

This guide explains how to properly delete websites from the NEXA system, including all associated data (vectors, widgets, and database records). There are multiple deletion endpoints available depending on your needs.

## Table of Contents

1. [Available Deletion Endpoints](#available-deletion-endpoints)
2. [Complete Deletion Process](#complete-deletion-process)
3. [Step-by-Step Deletion Guide](#step-by-step-deletion-guide)
4. [API Reference](#api-reference)
5. [Frontend Implementation](#frontend-implementation)
6. [Cleanup Verification](#cleanup-verification)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

---

## Available Deletion Endpoints

### 1. User Website Deletion (Complete Deletion)
**Endpoint**: `DELETE /user/websites/:websiteId`
- ✅ Deletes from main Website collection
- ✅ Removes from user's embedded website list
- ✅ Deletes associated widget (if exists)
- **Updated**: Now performs complete deletion from everywhere

### 2. Server Website Deletion (Complete Deletion)
**Endpoint**: `DELETE /websites/:websiteId`
- ✅ Deletes from main Website collection
- ✅ Removes from user's embedded list
- ⚠️ Widget deletion not implemented (manual cleanup required)

### 🎯 **Recommendation**
Use **`DELETE /user/websites/:websiteId`** for complete cleanup as it now handles widget deletion automatically.

### ⚠️ Common Issue Fixed

**Problem**: Getting "Website not found in your crawled websites" error even when website exists.

**Root Cause**: The embedded `crawledWebsites` subdocuments have different `_id` values than the main Website collection documents.

**Solution**: Updated `/user/websites/:websiteId` endpoint to:
1. First lookup the website in the main Website collection using the provided ID
2. Verify user ownership
3. Delete associated widget (if exists)
4. Delete from main Website collection
5. Remove from embedded documents using `jobId` or `url` matching

**Impact**: The `/user/websites/:websiteId` endpoint now performs complete deletion from all locations.

---

## Complete Deletion Process

When a website is deleted, the following data should be cleaned up:

```
Website Database Record → User Embedded Documents → Associated Widget → Vector Embeddings
```

### What Gets Deleted Automatically

1. **Website Record**: Removed from main `Website` collection
2. **User References**: Removed from user's `crawledWebsites` array
3. **Basic Metadata**: Job references and status information

### What Requires Manual Cleanup

1. **Vector Embeddings**: Pinecone vectors (requires separate API call)
2. **Associated Widgets**: Widget records (currently not auto-deleted)
3. **Background Jobs**: Active crawling jobs (if website is being processed)

---

## Step-by-Step Deletion Guide

### Step 1: Get Website Information

First, retrieve the website details to get necessary information for cleanup:

```bash
curl -X GET "http://localhost:3000/user/websites/WEBSITE_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:
```json
{
  "website": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "url": "https://example.com",
    "domain": "example.com",
    "owner": "64f5a1b2c3d4e5f6a7b8c9d0",
    "ownerEmail": "user@example.com",
    "status": "completed",
    "hasWidget": true,
    "widgetId": "64f5a1b2c3d4e5f6a7b8c9d3"
  }
}
```

### Step 2: Delete the Website (Recommended Method)

Use the complete deletion endpoint that handles everything:

```bash
curl -X DELETE "http://localhost:3000/user/websites/WEBSITE_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response**:
```json
{
  "message": "Website and all associated data deleted successfully",
  "deletedWebsite": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "url": "https://example.com",
    "domain": "example.com"
  },
  "deletedWidget": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d3",
    "widgetId": "widget_abc123def456"
  }
}
```

**What This Deletes Automatically**:
- ✅ Website record from main collection
- ✅ User's embedded website references
- ✅ Associated widget (if exists)

### Step 3: Verify Deletion (Optional)

Since the endpoint now handles everything, you can skip to verification:

```bash
# Verify website is deleted
curl -X GET "http://localhost:3000/user/websites/WEBSITE_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
# Should return 404
```

⚠️ **Important**: Vector cleanup is not automatic and must be done separately.

#### Option A: Delete All User Vectors (Nuclear Option)
```bash
# Using the delete script
node delete-pinecone-data.js

# Or delete by user email pattern
# This requires custom implementation
```

#### Option B: Delete Specific Website Vectors (Recommended)
*Note: This functionality needs to be implemented using the `deleteVectorsByFilter` pattern*

```javascript
// Custom cleanup function (to be implemented)
async function deleteWebsiteVectors(userEmail, websiteDomain) {
  // Implementation using Pinecone delete by filter
  await deleteVectorsByFilter({
    userEmail: userEmail,
    website: websiteDomain
  });
}
```

### Step 4: Clean Up Vector Embeddings (Manual)

✅ **Widget deletion is now automatic** when using `DELETE /user/websites/:websiteId`

For manual widget cleanup (if needed):
```bash
curl -X DELETE "http://localhost:3000/widget/website/WEBSITE_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## API Reference

### 1. Complete Website Deletion (Recommended)

**Endpoint**: `DELETE /user/websites/:websiteId`

**Authentication**: Required (`Authorization: Bearer <token>`)

**Path Parameters**:
- `websiteId`: MongoDB ObjectId of the website

**What Gets Deleted**:
- ✅ Website record from main collection
- ✅ User's embedded website references  
- ✅ Associated widget (automatic)
- ⚠️ Vector embeddings (manual cleanup required)

**Success Response** (200):
```json
{
  "message": "Website and all associated data deleted successfully",
  "deletedWebsite": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "url": "https://example.com",
    "domain": "example.com"
  },
  "deletedWidget": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d3",
    "widgetId": "widget_abc123def456"
  }
}
```

### 2. Alternative Deletion Endpoint

**Endpoint**: `DELETE /websites/:websiteId`

**Authentication**: Required (`Authorization: Bearer <token>`)

**What Gets Deleted**:
- ✅ Website record from main collection
- ✅ User's embedded website references
- ⚠️ Widget deletion not automatic

**Success Response** (200):
```json
{
  "message": "Website deleted successfully",
  "deletedWebsite": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "url": "https://example.com",
    "domain": "example.com"
  }
}
```

**Error Responses**:
```json
// 404 - Website not found or permission denied
{
  "error": "Website not found",
  "message": "Website not found or you do not have permission to access it"
}

// 500 - Server error
{
  "error": "Failed to delete website",
  "message": "Internal server error"
}
```

### 2. User Website Deletion (Alternative)

**Endpoint**: `DELETE /user/websites/:websiteId`

**Authentication**: Required (`Authorization: Bearer <token>`)

**Success Response** (200):
```json
{
  "message": "Website deleted successfully"
}
```

**Error Responses**:
```json
// 404 - Website not found or permission denied
{
  "error": "Website not found",
  "message": "Website not found or you do not have permission to access it"
}

// 500 - Server error
{
  "error": "Failed to delete website",
  "message": "Internal server error"
}
```

### 🎯 **Recommendation**
Use **`DELETE /user/websites/:websiteId`** as it now provides the most comprehensive deletion including automatic widget cleanup.

---

## Frontend Implementation

### React Example

```jsx
import { useState } from 'react';

function WebsiteDeleteButton({ websiteId, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Step 1: Delete the website
      const response = await fetch(`/websites/${websiteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete website');
      }

      const result = await response.json();
      
      // Step 2: Optionally trigger vector cleanup
      // await cleanupVectors(result.deletedWebsite);
      
      // Notify parent component
      onDeleted(websiteId);
      
      alert('Website deleted successfully!');
      
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Failed to delete website: ${error.message}`);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="delete-confirm">
        <p>⚠️ This will permanently delete the website and all associated data.</p>
        <button onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Confirm Delete'}
        </button>
        <button onClick={() => setShowConfirm(false)}>Cancel</button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setShowConfirm(true)}
      className="delete-btn"
    >
      Delete Website
    </button>
  );
}
```

### JavaScript/Vanilla Implementation

```javascript
async function deleteWebsite(websiteId) {
  const token = localStorage.getItem('token');
  
  // Confirm deletion
  const confirmed = confirm(
    'Are you sure you want to delete this website? This action cannot be undone.'
  );
  
  if (!confirmed) return;

  try {
    // Show loading state
    document.getElementById('delete-btn').disabled = true;
    document.getElementById('delete-btn').textContent = 'Deleting...';

    const response = await fetch(`/websites/${websiteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete website');
    }

    const result = await response.json();
    console.log('Deleted:', result);

    // Remove from UI
    document.getElementById(`website-${websiteId}`).remove();
    
    // Show success message
    showNotification('Website deleted successfully!', 'success');

  } catch (error) {
    console.error('Delete error:', error);
    showNotification(`Failed to delete: ${error.message}`, 'error');
  } finally {
    // Reset button state
    document.getElementById('delete-btn').disabled = false;
    document.getElementById('delete-btn').textContent = 'Delete';
  }
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
```

---

## Cleanup Verification

### 1. Verify Website Deletion

```bash
# Should return 404
curl -X GET "http://localhost:3000/user/websites/DELETED_WEBSITE_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Check User's Website List

```bash
curl -X GET "http://localhost:3000/user/websites" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

The deleted website should not appear in the list.

### 3. Verify Vector Cleanup (Manual Check)

```javascript
// Check if vectors still exist in Pinecone
// This requires implementing a search/count function
const remainingVectors = await searchVectors({
  filter: {
    userEmail: 'user@example.com',
    website: 'deleted-domain.com'
  }
});

console.log('Remaining vectors:', remainingVectors.length);
```

---

## Error Handling

### Common Error Scenarios

1. **Website Not Found (404)**
   - Website doesn't exist in main collection
   - Invalid website ID format
   - User doesn't own the website (permission denied)

2. **Deletion in Progress (409)**
   - Website currently being crawled
   - Background job still processing

3. **Permission Denied (403)**
   - User not authenticated
   - User doesn't own the website

4. **Server Error (500)**
   - Database connection issues
   - Internal processing error

### Fixed Issue: ID Mismatch

**Previous Problem**: 
```json
{
  "error": "Website not found",
  "message": "Website not found in your crawled websites"
}
```

**Root Cause**: The `/user/websites/:websiteId` endpoint was trying to find embedded subdocuments by their auto-generated `_id`, which differs from the main Website collection `_id`.

**Solution**: Updated endpoint to:
1. Lookup website in main collection first
2. Verify ownership
3. Remove from embedded documents using `jobId` or `url` matching

**Result**: Both endpoints now accept the same Website collection `_id` parameter.

### Error Handling Implementation

```javascript
async function handleWebsiteDeletion(websiteId) {
  try {
    const response = await deleteWebsite(websiteId);
    return { success: true, data: response };
    
  } catch (error) {
    // Handle specific error types
    if (error.status === 404) {
      return { 
        success: false, 
        error: 'Website not found or already deleted' 
      };
    } else if (error.status === 403) {
      return { 
        success: false, 
        error: 'You do not have permission to delete this website' 
      };
    } else if (error.status === 409) {
      return { 
        success: false, 
        error: 'Website is currently being processed. Please try again later.' 
      };
    } else {
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    }
  }
}
```

---

## Best Practices

### 1. Pre-Deletion Checks

```javascript
async function performPreDeletionChecks(websiteId) {
  const checks = [];
  
  // Check if website exists and get details
  const website = await getWebsiteDetails(websiteId);
  if (!website) {
    throw new Error('Website not found');
  }
  
  // Check if website is currently being processed
  if (website.status === 'crawling') {
    checks.push('⚠️ Website is currently being crawled');
  }
  
  // Check if widget exists
  if (website.hasWidget) {
    checks.push('🔧 Website has an associated widget that will be orphaned');
  }
  
  // Check vector count (if implemented)
  // const vectorCount = await getVectorCount(website.domain);
  // checks.push(`📊 ${vectorCount} vectors will remain in database`);
  
  return checks;
}
```

### 2. Batch Deletion

```javascript
async function deleteMultipleWebsites(websiteIds) {
  const results = [];
  
  for (const websiteId of websiteIds) {
    try {
      const result = await deleteWebsite(websiteId);
      results.push({ websiteId, success: true, data: result });
    } catch (error) {
      results.push({ websiteId, success: false, error: error.message });
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}
```

### 3. Confirmation Dialog

```javascript
function showDeletionConfirmation(websiteDetails) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h3>⚠️ Delete Website</h3>
          <p>You are about to delete:</p>
          <ul>
            <li><strong>URL:</strong> ${websiteDetails.url}</li>
            <li><strong>Pages:</strong> ${websiteDetails.pagesCrawled || 0}</li>
            <li><strong>Status:</strong> ${websiteDetails.status}</li>
          </ul>
          <p><strong>This action cannot be undone.</strong></p>
          <div class="modal-actions">
            <button id="confirm-delete" class="btn-danger">Delete</button>
            <button id="cancel-delete" class="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('confirm-delete').onclick = () => {
      document.body.removeChild(modal);
      resolve(true);
    };
    
    document.getElementById('cancel-delete').onclick = () => {
      document.body.removeChild(modal);
      resolve(false);
    };
  });
}
```

### 4. Cleanup Scheduling

```javascript
// Schedule cleanup tasks after deletion
async function scheduleCleanupTasks(deletedWebsite) {
  const tasks = [];
  
  // Schedule vector cleanup (if implemented)
  if (deletedWebsite.chunksProcessed > 0) {
    tasks.push({
      type: 'vector_cleanup',
      userEmail: deletedWebsite.ownerEmail,
      domain: deletedWebsite.domain,
      scheduledFor: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });
  }
  
  // Schedule widget cleanup (if exists)
  if (deletedWebsite.hasWidget) {
    tasks.push({
      type: 'widget_cleanup',
      widgetId: deletedWebsite.widgetId,
      scheduledFor: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
    });
  }
  
  // Submit cleanup tasks to background queue
  for (const task of tasks) {
    await enqueueCleanupTask(task);
  }
}
```

---

## Quick Reference

### Essential Commands

```bash
# Get website details
GET /user/websites/:websiteId

# Delete website (recommended)
DELETE /websites/:websiteId

# Delete from user list only
DELETE /user/websites/:websiteId

# Verify deletion
GET /user/websites
```

### Required Headers

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Success Indicators

- **200 status** with success message
- Website removed from user's website list
- Website record deleted from database
- No 404 errors when accessing deleted website

---

*For complete vector cleanup and advanced deletion scenarios, additional implementation may be required. Contact the development team for assistance with custom cleanup requirements.*
