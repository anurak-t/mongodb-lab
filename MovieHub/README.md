# MovieHub

MovieHub เป็น Mini App สำหรับฝึกใช้งาน MongoDB ผ่าน Node.js และ Express โดยใช้ `sample_mflix` จาก MongoDB Atlas

ตัวแอปมีหน้าใช้งานแบบ Production ได้แก่ Login/Register, Dashboard และ Movies CRUD แต่ function ที่ติดต่อ MongoDB ยังเป็นโจทย์ให้นักศึกษาเขียนเอง

## หลักการของโจทย์

นักศึกษาต้องเขียน function ให้เรียก MongoDB และ **return ผลลัพธ์สุดท้ายที่ API ใช้งานได้ทันที**

## Environment ที่ต้องใช้

- Node.js 20 ขึ้นไป
- MongoDB Atlas Account
- Visual Studio Code หรือ IDE อื่น

## ติดตั้งโปรเจกต์

เปิด PowerShell:

```powershell
cd <local path>\MovieHub\api
npm install
Copy-Item .env.example .env
```

กำหนดค่าใน `api/.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/?retryWrites=true&w=majority
MOVIE_DB_NAME=sample_mflix
APP_DB_NAME=moviehub
JWT_SECRET=replace-with-a-long-random-secret
PORT=3000
```

## รันโปรเจกต์

```powershell
cd D:\PSU\mongo\MovieHub\api
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)


## ไฟล์ที่นักศึกษาแก้

หลังจากตั้งค่า `api/.env` แล้ว ให้แก้ source code เพียงไฟล์เดียว:

```text
MovieHub/api/labs.js
```

ห้ามแก้:

- ชื่อ function และ parameters ใน `labs.js`
- รูปแบบข้อมูลที่แต่ละ function ต้อง return
- `api/server.js`, `api/db.js`, `api/auth.js` และ `api/movie-utils.js`
- ไฟล์ทั้งหมดใน `ui/`

ค้นหาโจทย์ทั้งหมด:

```powershell
cd \MovieHub\api
rg -n "^// TODO" labs.js
```

## Return contract

| Function | ผลลัพธ์ที่ต้อง return |
|---|---|
| `registerUser()` | User document ที่สร้างสำเร็จและมี `_id` |
| `findUser()` | User document 1 รายการ หรือ `null` |
| `getDashboardData()` | Object ที่มี `metrics`, `topGenres`, `topMovies` |
| `listMovies()` | Object ที่มี `items`, `page`, `limit`, `total`, `totalPages` |
| `findMovieById()` | Movie document 1 รายการ หรือ `null` |
| `createMovie()` | Movie document ที่สร้างสำเร็จและมี `_id` |
| `updateMovie()` | Movie document หลังอัปเดต หรือ `null` |
| `deleteMovie()` | จำนวน document ที่ลบ เช่น `0` หรือ `1` |

## โจทย์ 8 ข้อ

### TODO 1 — Register

เขียน `registerUser()` ให้บันทึก `userDocument` ลง `usersCollection` และ return User document ที่มี `_id`

ตรวจผล:

1. เปิดหน้า Create account
2. สร้างบัญชีใหม่
3. ตรวจว่า User ถูกบันทึกใน Database `moviehub` Collection `users`

### TODO 2 — Login และ Current session

เขียน `findUser()` ให้ค้นหา User ตาม `filter` และรองรับ `options` ที่ Route ส่งมา เช่น Projection

Function นี้ถูกใช้ทั้ง Login ที่ค้นหาด้วย Email และ `/api/auth/me` ที่ค้นหาด้วย `_id`

ตรวจผล:

1. Sign out จากบัญชีที่สร้างใน TODO 1
2. Sign in ด้วย Email และ Password เดิม
3. Refresh หน้า Dashboard แล้ว Session ต้องยังทำงาน

### TODO 3 — Dashboard

เขียน `getDashboardData()` ให้ Query และ Aggregate ข้อมูลต่อไปนี้:

- จำนวน Movie ทั้งหมด
- จำนวน Movie ที่มี IMDb rating
- Average IMDb rating
- Average runtime
- จำนวน Comment ทั้งหมด
- 6 Genre ที่มี Movie มากที่สุด
- 6 Movie ที่มี IMDb rating สูงที่สุด

ต้อง return object ตามรูปแบบ mock เดิมใน function

ตรวจผล: Dashboard ต้องแสดงตัวเลข กราฟ Genre และตาราง Top Movies จากข้อมูลจริง

### TODO 4 — Movie list, Search และ Pagination

เขียน `listMovies()` โดยใช้ค่าจาก `queryOptions`:

- `filter`
- `projection`
- `sort`
- `page`
- `limit`

ต้อง Query รายการ Movie และจำนวนทั้งหมด แล้ว return Pagination result ตาม contract

ตรวจผล:

1. หน้า Movies แสดงข้อมูลจริง
2. Search ชื่อเรื่องทำงาน
3. Filter Genre และ Rating ทำงาน
4. Sort และปุ่ม Previous/Next ทำงาน

### TODO 5 — Movie detail

เขียน `findMovieById()` ให้ค้นหา Movie จาก `movieObjectId` และ return document หรือ `null`

ตรวจผล: หลังทำ TODO 6 แล้ว กด Edit ที่ Movie ของตนเอง แบบฟอร์มต้องแสดงข้อมูลเดิมครบ

### TODO 6 — Create movie

เขียน `createMovie()` ให้เพิ่ม `movieDocument` ลง Collection และ return document ที่สร้างสำเร็จพร้อม `_id`

ตรวจผล:

1. กด **Add movie**
2. กรอกข้อมูลและบันทึก
3. ตรวจว่า Movie ใหม่อยู่ใน Atlas และค้นหาได้จากหน้า Movies

### TODO 7 — Update movie

เขียน `updateMovie()` ให้แก้ Movie ที่ตรงกับ `filter` ด้วย `updateFields` และ return document หลังอัปเดต

ตรวจผล: แก้ Runtime หรือ Genre ของ Movie ที่สร้างเอง แล้วเปิด Edit อีกครั้ง ค่าต้องเป็นค่าใหม่

### TODO 8 — Delete movie

เขียน `deleteMovie()` ให้ลบ Movie ที่ตรงกับ `filter` และ return จำนวน document ที่ลบ

ตรวจผล: ลบ Movie ที่สร้างเองแล้วต้องค้นหาไม่พบทั้งในหน้า Movies และ Atlas