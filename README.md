# Flood Rescue System

A Spring Boot + MongoDB based disaster management platform that helps victims, NGOs, donors, and admins coordinate during flood emergencies in real time.

## Features

### Victim Reporting

* Report flood incidents with:

  * Location coordinates
  * Severity level
  * Description
* Geo-based flood tracking using MongoDB GeoJSON.

### NGO Resource Requests

* NGOs can:

  * Create rescue/resource requests
  * Manage relief operations
  * Track donations

### Donation System

* Donors can:

  * Donate resources/funds to NGO requests
  * View active rescue campaigns

### Admin Monitoring

* Admin dashboard for:

  * Monitoring flood activity
  * Tracking users and reports
  * Managing overall system operations

### Flood Severity Aggregation

* Regional flood severity calculation using:

  * Geo indexing
  * Multiple victim reports
  * Average/manual severity scoring

### Future Enhancements

* AI-based flood image severity detection
* Heatmap visualization
* Email notifications
* Live rescue status updates

---

# Tech Stack

## Backend

* Java
* Spring Boot
* Spring Security
* JWT Authentication
* Spring Data MongoDB

## Database

* MongoDB

## Tools & Libraries

* Lombok
* Maven
* JavaMail Sender
* MongoDB GeoSpatial Queries

---

# Project Structure

```plaintext
src/
 ├── controller/
 ├── service/
 ├── repository/
 ├── model/
 ├── dto/
 ├── security/
 ├── config/
 └── util/
```

---

# API Modules

## Authentication

* Register
* Login
* JWT token generation

## Flood Reports

* Create report
* View nearby reports
* Severity analysis

## NGO Requests

* Create NGO request
* Update request status
* Fetch active requests

## Donations

* Donate to NGO requests
* Track donations

---

# Database Models

* User
* FloodReport
* NgoRequest
* Donation
* RegionSeverity

---

# Setup Instructions

## Clone Repository

```bash
git clone YOUR_REPOSITORY_LINK
cd FloodRescueSystem
```

---

## Configure Environment Variables

Create:

```plaintext
application-dev.properties
```

Example:

```properties
spring.data.mongodb.uri=YOUR_MONGO_URI

spring.mail.host=smtp-relay.brevo.com
spring.mail.port=587
spring.mail.username=YOUR_USERNAME
spring.mail.password=YOUR_PASSWORD
```

---

## Run MongoDB

Make sure MongoDB is running locally on:

```plaintext
mongodb://localhost:27017
```

---

## Run Project

### Windows

```bash
mvnw spring-boot:run
```

### Linux/Mac

```bash
./mvnw spring-boot:run
```

---

# Future Scope

* AI flood image analysis
* Real-time notifications
* Heatmaps using GIS
* Mobile app integration
* Rescue route optimization

---

# Author

Harnimar Singh

---

# License

This project is developed for educational and learning purposes.
