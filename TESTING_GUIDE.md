# HomeConnect Pro - Testing Guide

## Core Features Testing

### 1. Browse Projects & Contractors
- **Home Page**: View featured projects and contractors
- **Find Contractors**: Search by category, use location-based filtering
- **Project Listings**: Browse all available projects

### 2. Location-Based Search
- Click "Use My Location" on Find Contractors page
- Allow browser location access
- See contractors within 20km radius
- Adjust search radius (5km-100km)

### 3. Authentication System
- Click "Login / Sign Up" button
- Test registration with:
  - Email: test@example.com
  - Password: password123
  - Choose Homeowner or Contractor
- Test login with existing credentials

### 4. Project Management
- **Post Project**: 
  - Go to "Post Project" page
  - Fill in project details
  - Upload photos (optional)
  - Submit project
- **View Project Details**: Click "View Details" on any project card

### 5. Bidding System
- **Submit Bid**: On project details page, click "Submit Bid"
- **Accept/Reject Bids**: As homeowner, manage incoming bids
- **Track Bids**: Use "My Bids" page to monitor bid status

### 6. Messaging
- **Start Conversation**: Click "Contact" on contractor/homeowner
- **Send Messages**: Type and send real-time messages
- **View Conversations**: Access message history

### 7. Contractor Profiles
- **View Profile**: Click "View Profile" on contractor cards
- **Company Details**: See ratings, experience, portfolio
- **Contact Info**: License, insurance, specialties

## Test Data Available

### Sample Contractors
1. **Johnson Construction** (San Francisco)
   - Specialties: Kitchen, Bathroom
   - 15 years experience
   - 4.9/5 rating

2. **Davis Electric** (Austin)
   - Specialties: Electrical, Solar
   - 12 years experience
   - 4.8/5 rating

### Sample Projects
1. **Complete Kitchen Renovation** ($15,000-25,000)
2. **Bathroom Upgrade** ($8,000-15,000)

## API Endpoints Working
- GET /api/projects - List all projects
- GET /api/contractors - List contractors (with location filtering)
- POST /api/projects - Create new project
- POST /api/bids - Submit bid
- POST /api/messages - Send message
- PUT /api/bids/:id/status - Accept/reject bids

## Location Features
- Automatic geolocation detection
- Distance calculation using Haversine formula
- Adjustable search radius
- Location-based contractor filtering

## File Upload
- Multi-file project photo uploads
- Image validation and storage
- File serving from /api/uploads/

Test any feature you're interested in - everything is fully functional!