# گزارش پروژه Drawing App

## خلاصه پروژه

پروژه Drawing App یک اپلیکیشن وب برای نقاشی است که از معماری Client-Server استفاده می‌کند. کاربران می‌توانند با کشیدن و رها کردن اشکال مختلف، نقاشی‌ه ایجاد کنند و آنها را ذخیره و مدیریت کنند.

## معماری کلی سیستم

### Frontend (React)
- **تکنولوژی:** React.js با JavaScript
- **وظایف:** رابط کاربری، Drag & Drop، مدیریت state محلی
- **پورت:** 3000

### Backend (Spring Boot)
- **تکنولوژی:** Spring Boot با Java
- **وظایف:** REST API، احراز هویت، مدیریت داده‌ها
- **پورت:** 5000

### Database
- **نوع:** H2 Database (In-Memory)
- **هدف:** ذخیره‌سازی کاربران و نقاشی‌ها

---

## Frontend - React Application

### ساختار کلی
src/

├── DrawingApp.js      # کامپوننت اصلی

├── DrawingApp.css     # استایل‌ها

└── index.js          # نقطه ورود برنامه


### ویژگی‌های کلیدی

#### 1. مدیریت State
```javascript
const [shapes, setShapes] = useState([]);           // لیست اشکال روی canvas
const [paintingName, setPaintingName] = useState(); // نام نقاشی
const [selectedColor, setSelectedColor] = useState('#ff6b6b'); // رنگ انتخابی
```

#### 2. سیستم Drag & Drop
- **Drag Start:** ایجاد تصویر custom برای drag
- **Drop Handler:** محاسبه موقعیت و ایجاد شکل جدید
- **Shape Types:** مربع، دایره، مثلث، ذوزنقه

#### 3. مدیریت اشکال
- **ایجاد:** با drag & drop از sidebar به canvas
- **حذف:** double-click روی شکل
- **انتخاب رنگ:** 3 رنگ پیش‌فرض قابل انتخاب

#### 4. عملیات فایل
- **Export:** ذخیره نقاشی به فرمت JSON
- **Import:** بارگذاری نقاشی از فایل JSON

### طراحی UI/UX

#### Layout
- **Header:** نام نقاشی + دکمه‌های Import/Export
- **Sidebar:** انتخابگر رنگ + لیست اشکال
- **Canvas:** منطقه اصلی نقاشی
- **Footer:** تعداد هر نوع شکل

#### Responsive Design
- برای صفحه‌نمایش‌های کوچک‌تر از 768px
- تغییر layout از horizontal به vertical
- تنظیم اندازه‌ها و فاصله‌ها

---

## Backend - Spring Boot API

### ساختار پروژه
src/main/java/com/drawingapp/

├── config/

├── entity/

├── repository/

├── dto/

├── service/

├── controller/

└── DataInitializer.java


### لایه‌های معماری

#### 1. Configuration Layer
```xml
<!-- pom.xml dependencies -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
</dependency>
```

**application.properties:**
- سرور روی پورت 5000
- پیکربندی H2 Database
- فعال‌سازی CORS برای React

#### 2. Entity Layer

**User Entity:**
```java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue
    private Long id;
    
    @Column(unique = true)
    private String username;
    
    private String password;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Painting> paintings;
}
```

**Painting Entity:**
```java
@Entity
@Table(name = "paintings")
public class Painting {
    @Id @GeneratedValue
    private Long id;
    
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String shapeData; // JSON format
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
```

#### 3. Repository Layer
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}

@Repository
public interface PaintingRepository extends JpaRepository<Painting, Long> {
    List<Painting> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
```

#### 4. DTO Layer
```java
public class LoginRequest {
    @NotBlank
    private String username;
    
    @NotBlank
    private String password;
}

public class PaintingRequest {
    @NotBlank
    private String name;
    
    @NotNull
    private List<Object> shapes;
}
```

#### 5. Service Layer

**AuthService:**
- اعتبارسنجی کاربر
- مدیریت session

**PaintingService:**
- عملیات CRUD برای نقاشی‌ها
- کنترل مالکیت (Ownership)
- تبدیل Object ↔ JSON

#### 6. Controller Layer

**API Endpoints:**
POST /api/login                    # احراز هویت
GET  /api/paintings?userId={id}    # لیست نقاشی‌ها
GET  /api/paintings/{id}?userId={uid} # یک نقاشی خاص
POST /api/paintings?userId={id}    # ایجاد نقاشی
PUT  /api/paintings/{id}?userId={uid} # آپدیت نقاشی
DELETE /api/paintings/{id}?userId={uid} # حذف نقاشی


---

## Workflow

### 1. شروع اپلیکیشن
1. Backend: ایجاد 3 کاربر پیش‌فرض
2. Frontend: نمایش صفحه اصلی
3. کاربر: انتخاب رنگ و شروع نقاشی

### 2. ایجاد نقاشی
1. انتخاب رنگ از color palette
2. Drag کردن شکل از sidebar
3. Drop کردن روی canvas
4. ثبت موقعیت و رنگ شکل

### 3. مدیریت نقاشی‌ها
1. تغییر نام نقاشی
2. Export به JSON
3. Import از JSON
4. حذف اشکال (double-click)

### 4. ذخیره‌سازی
1. تبدیل shapes به JSON
2. ارسال به Backend API
3. ذخیره در Database
4. بازگشت تأیید به Frontend

---

## امنیت و کنترل دسترسی

### Frontend Security
- Validation ورودی‌ها
- Sanitization داده‌های JSON

### Backend Security
- کنترل مالکیت نقاشی‌ها
- Validation با Bean Validation
- CORS configuration
- Input sanitization

---

## ذخیره‌سازی داده‌ها

### ساختار JSON نقاشی
```json
{
  "name": "My Painting",
  "shapes": [
    {
      "id": 1640995200000,
      "type": "circle",
      "x": 100,
      "y": 150,
      "color": "#ff6b6b"
    }
  ]
}
```

### Database Schema
```sql
-- Users table
users (id, username, password, created_at, updated_at)

-- Paintings table  
paintings (id, name, shape_data, user_id, created_at, updated_at)
```

---

## نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 14+
- Java 11+
- Maven 3.6+

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend  
```bash
cd frontend
npm install
npm start
```

---


## خلاصه فنی

**Frontend:**
- React functional components با Hooks
- CSS flexbox برای layout
- HTML5 Drag & Drop API
- File API برای import/export

**Backend:**
- Spring Boot 2.7+
- Spring Data JPA
- H2 Database
- RESTful API design
- Layered Architecture

**Communication:**
- HTTP REST API
- JSON data format  
- CORS enabled
- Error handling standardized

