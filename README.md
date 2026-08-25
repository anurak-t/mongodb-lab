# MongoDB MQL Labs

เอกสารนี้เป็น Lab สำหรับฝึก MongoDB Query Language (MQL) กับ Database `sample_mflix` บน MongoDB Atlas โดยใช้ Database Client Extension ใน VS Code เป็นเครื่องมือทดสอบหลัก


## เตรียม Environment

### วัตถุประสงค์

- เชื่อมต่อ MongoDB Atlas จาก VS Code ได้
- ตรวจสอบว่ามี Database `sample_mflix` และ Collection ที่ต้องใช้
- อ่าน Document ตัวอย่างเพื่อรู้จักชนิดข้อมูลและ Field สำคัญ

### ขั้นตอน

1. สร้าง MongoDB Atlas Account และสร้าง Free Cluster
2. ติดตั้ง Database Client Extension ใน VS Code และสร้าง Connection ไปยัง Atlas
3. เปิด `sample_mflix` แล้วตรวจสอบ Collection `movies`, `comments` และ `users`
4. สร้าง Query ใหม่ใต้ Database `sample_mflix` และทดสอบคำสั่งต่อไปนี้

```javascript
db("sample_mflix")
  .collection("movies")
  .find({})
  .limit(3)
  .toArray();
```

### Syntax focus

`db()`, `collection()`, `find()`, `limit()`, `toArray()`

### สิ่งที่ควรสังเกต

- `genres`, `cast` และ `countries` เป็น Array
- `imdb` เป็น Nested Document และเข้าถึง rating ด้วย `"imdb.rating"`
- `_id` ของ `movies` เป็น `ObjectId` และเชื่อมกับ `comments.movie_id`


---

## Lab 1 — อ่านข้อมูลด้วย `find()`

### วัตถุประสงค์

- เข้าใจความแตกต่างระหว่าง `find()` และ `findOne()`
- เขียน Filter Document เบื้องต้นได้
- ใช้ `limit()` เพื่อควบคุมจำนวน Document ที่อ่าน

### เนื้อหาและ Syntax

| หัวข้อ | Syntax หลัก |
|---|---|
| อ่านทุก Document | `find({})` |
| อ่าน Document เดียว | `findOne(filter)` |
| ค้นหาด้วยค่าที่เท่ากัน | `find({ field: value })` |
| จำกัดผลลัพธ์ | `limit(number)` |

### ขั้นตอนฝึกปฏิบัติ

1. อ่านภาพยนตร์ 5 รายการแรกด้วย `find({})`
2. ค้นหาภาพยนตร์จากชื่อด้วย `findOne()`
3. ค้นหาภาพยนตร์ทั้งหมดที่ออกฉายในปีที่กำหนด
4. เปรียบเทียบผลลัพธ์ของ `findOne()` กับ `find().limit(1)`

### ตัวอย่าง Syntax

```javascript
db("sample_mflix")
  .collection("movies")
  .findOne({ title: "The Godfather" });
```

```javascript
db("sample_mflix")
  .collection("movies")
  .find({ year: 2000 })
  .limit(10)
  .toArray();
```

### Challenge

- ค้นหาภาพยนตร์ที่มี `type` เป็น `movie`
- ค้นหาภาพยนตร์จากประเทศที่กำหนด แล้วแสดงไม่เกิน 10 รายการ

---

## Lab 2 — เพิ่ม แก้ไข และลบข้อมูลด้วย CRUD

### วัตถุประสงค์

- เพิ่ม Document ด้วย `insertOne()` และอ่านค่า `_id` ที่ MongoDB สร้างให้
- แก้ไขเฉพาะ Field ที่ต้องการด้วย `updateOne()` และ `$set`
- ลบ Document ที่ตรงกับ Filter ด้วย `deleteOne()`
- อ่านค่าผลลัพธ์จากคำสั่งเขียน เช่น `insertedId`, `matchedCount`, `modifiedCount` และ `deletedCount`

### เนื้อหาและ Syntax

| การทำงาน | Syntax หลัก | ค่าที่ควรตรวจสอบ |
|---|---|---|
| เพิ่มหนึ่ง Document | `insertOne(document)` | `insertedId` |
| เพิ่มหลาย Document | `insertMany([document, ...])` | `insertedIds` |
| แก้ไขหนึ่ง Document | `updateOne(filter, update)` | `matchedCount`, `modifiedCount` |
| แก้ไขหลาย Document | `updateMany(filter, update)` | `matchedCount`, `modifiedCount` |
| ลบหนึ่ง Document | `deleteOne(filter)` | `deletedCount` |
| ลบหลาย Document | `deleteMany(filter)` | `deletedCount` |

### ขั้นตอนฝึกปฏิบัติ

1. เพิ่ม Movie สำหรับการทดลองลงใน `movies`
2. ตรวจสอบ `_id` จากผลลัพธ์ของ `insertOne()`
3. แก้ไขปีและเพิ่ม Genre ของ Movie ที่เพิ่งเพิ่ม
4. อ่าน Document หลังแก้ไขเพื่อตรวจสอบผลลัพธ์
5. ลบ Movie ด้วย `labKey` แล้วตรวจสอบว่าไม่พบ Document อีก

### ตัวอย่าง `insertOne()`

กำหนด `labKey` เองเพื่อใช้เป็นตัวระบุที่อ่านง่ายและใช้ใน Filter ของคำสั่งถัดไป หากรันซ้ำ ให้เปลี่ยนค่า `labKey` หรือ ลบ Document เดิมก่อน

```javascript
db("sample_mflix")
  .collection("mql_lab_movies")
  .insertOne({
    labKey: "mql-lab-crud-001",
    title: "MQL CRUD Practice",
    year: 2026,
    genres: ["Learning"]
  });
// ดูผลลัพธ์ใน Result pane และตรวจสอบ insertedId
```

ถ้าต้องการเพิ่มหลาย Document ให้ใช้ `insertMany()` โดยส่ง Array ของ Document:

```javascript
db("sample_mflix")
  .collection("mql_lab_movies")
  .insertMany([
    { labKey: "mql-lab-crud-002", title: "Second Practice", year: 2026 },
    { labKey: "mql-lab-crud-003", title: "Third Practice", year: 2026 }
  ]);
```

### ตัวอย่าง `updateOne()`

`updateOne()` ต้องมี Filter และ Update Document โดยใช้ `$set` เพื่อแก้เฉพาะ Field ที่ระบุ ไม่เขียนทับทั้ง Document

```javascript
db("sample_mflix")
  .collection("mql_lab_movies")
  .updateOne(
    { labKey: "mql-lab-crud-001" },
    {
      $set: {
        year: 2027,
        status: "updated"
      },
      $addToSet: {
        genres: "MongoDB"
      }
    }
  );
// ดูผลลัพธ์ใน Result pane และตรวจสอบ matchedCount กับ modifiedCount
```

จากนั้นอ่านข้อมูลหลังแก้ไขด้วย `findOne()`:

```javascript
db("sample_mflix")
  .collection("mql_lab_movies")
  .findOne({ labKey: "mql-lab-crud-001" });
```

`matchedCount` คือจำนวน Document ที่ตรงกับ Filter ส่วน `modifiedCount` คือจำนวน Document ที่ถูกเปลี่ยนจริง หากค่าเดิมเหมือนค่าที่ส่งไป `matchedCount` อาจเป็น `1` แต่ `modifiedCount` เป็น `0`

### ตัวอย่าง `deleteOne()`

```javascript
db("sample_mflix")
  .collection("mql_lab_movies")
  .deleteOne({ labKey: "mql-lab-crud-001" });
// ดูผลลัพธ์ใน Result pane และตรวจสอบ deletedCount === 1
```

ตรวจสอบว่าลบสำเร็จด้วยการค้นหาอีกครั้ง:

```javascript
db("sample_mflix")
  .collection("mql_lab_movies")
  .findOne({ labKey: "mql-lab-crud-001" });
// ผลลัพธ์ควรเป็น null
```

### สรุปผลลัพธ์ของคำสั่งเขียน

| ค่าผลลัพธ์ | ความหมาย |
|---|---|
| `insertedId` | `_id` ของ Document ที่เพิ่มสำเร็จด้วย `insertOne()` |
| `insertedIds` | Object ที่เก็บ `_id` ของแต่ละ Document จาก `insertMany()` |
| `matchedCount` | จำนวน Document ที่ตรงกับ Filter ของ Update |
| `modifiedCount` | จำนวน Document ที่ถูกแก้ไขจริง |
| `deletedCount` | จำนวน Document ที่ถูกลบจริง |

### Challenge

- เพิ่ม Document อีก 2 รายการ แล้วค้นหาด้วย `find({ labKey: { $regex: "^mql-lab" } })`
- แก้ไขเฉพาะรายการที่มี `year: 2026` ด้วย `updateMany()` และเพิ่ม Field `status: "reviewed"`
- ลบเฉพาะ Document ที่สร้างจาก Lab นี้ แล้วตรวจสอบจำนวนผลลัพธ์ด้วย `countDocuments()`

---

## Lab 3 — Filter และ Logical Operators

### วัตถุประสงค์

- เขียนเงื่อนไขเปรียบเทียบค่าได้
- รวมหลายเงื่อนไขด้วย AND, OR และ NOT ได้
- ตรวจสอบ Field ที่ไม่มีค่า หรือไม่อยู่ในรายการได้

### เนื้อหาและ Syntax

| กลุ่ม | Operators |
|---|---|
| เปรียบเทียบ | `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte` |
| เลือกจากรายการ | `$in`, `$nin` |
| ตรรกะ | `$and`, `$or`, `$nor`, `$not` |
| ตรวจสอบ Field | `$exists` |

### คู่มือการใช้ Comparison Operators

Operator กลุ่มนี้เขียนภายใน Field ที่ต้องการเปรียบเทียบ โดยรูปแบบทั่วไปคือ `{ field: { $operator: value } }`

| Operator | ความหมาย | รูปแบบใช้งาน |
|---|---|---|
| `$eq` | เท่ากับ | `{ year: { $eq: 2000 } }` |
| `$ne` | ไม่เท่ากับ | `{ type: { $ne: "series" } }` |
| `$gt` | มากกว่า | `{ runtime: { $gt: 120 } }` |
| `$gte` | มากกว่าหรือเท่ากับ | `{ year: { $gte: 2000 } }` |
| `$lt` | น้อยกว่า | `{ runtime: { $lt: 90 } }` |
| `$lte` | น้อยกว่าหรือเท่ากับ | `{ year: { $lte: 2010 } }` |

ใส่ Operator หลายตัวใน Field เดียวกันเพื่อกำหนดช่วงข้อมูลได้:

```javascript
// ภาพยนตร์ที่ออกฉายในช่วงปี 2000 ถึง 2010 รวมทั้งสองปี
{
  year: {
    $gte: 2000,
    $lte: 2010
  }
}
```

### คู่มือการใช้ `$in` และ `$nin`

ใช้เมื่อค่าที่ต้องการเปรียบเทียบมีได้หลายค่า โดย `$in` หมายถึง “อยู่ในรายการนี้” และ `$nin` หมายถึง “ไม่อยู่ในรายการนี้”

```javascript
// เลือกภาพยนตร์ที่ออกฉายในปีใดปีหนึ่งในรายการ
{ year: { $in: [1990, 2000, 2010] } }

// ตัด Document ที่มี type อยู่ในรายการออก
{ type: { $nin: ["series", "tvEpisode"] } }
```

### คู่มือการใช้ Logical Operators

| Operator | ใช้เมื่อ | รูปแบบใช้งาน |
|---|---|---|
| implicit AND | ทุกเงื่อนไขอยู่คนละ Field และต้องเป็นจริงทั้งหมด | `{ year: { $gte: 2000 }, runtime: { $lte: 120 } }` |
| `$and` | ต้องเขียน AND แบบชัดเจน หรือมีเงื่อนไขซ้ำ Field เดิม | `{ $and: [{ year: { $gte: 2000 } }, { runtime: { $lte: 120 } }] }` |
| `$or` | ต้องการให้จริงอย่างน้อยหนึ่งเงื่อนไข | `{ $or: [{ year: { $lt: 1950 } }, { runtime: { $gte: 180 } }] }` |
| `$nor` | ต้องการให้ไม่มีเงื่อนไขใดเป็นจริง | `{ $nor: [{ year: { $lt: 1950 } }, { runtime: { $gt: 180 } }] }` |
| `$not` | กลับผลของ Operator ภายใน Field เดียว | `{ runtime: { $not: { $gt: 120 } } }` |

> `$not` ต้องครอบ Query Operator ของ Field เช่น `$gt` หรือ `$regex` ไม่ได้ใช้ครอบ Filter ทั้งก้อนเหมือน `$or`

### คู่มือการใช้ `$exists`

```javascript
// คืนเฉพาะ Document ที่มี Field runtime แม้ค่าจะเป็น null
{ runtime: { $exists: true } }

// คืนเฉพาะ Document ที่ไม่มี Field runtime
{ runtime: { $exists: false } }
```

### ขั้นตอนฝึกปฏิบัติ

1. ค้นหาภาพยนตร์ที่มีความยาว (`runtime`) มากกว่าค่าที่กำหนด
2. ค้นหาภาพยนตร์ในช่วงปีที่กำหนด
3. ค้นหาภาพยนตร์ที่ตรงทั้งเงื่อนไขปีและความยาวด้วย implicit AND
4. ค้นหาภาพยนตร์ที่ตรงอย่างน้อยหนึ่งเงื่อนไขด้วย `$or`
5. ตรวจหา Document ที่ไม่มี Field `runtime`

### ตัวอย่าง Syntax

```javascript
db("sample_mflix")
  .collection("movies")
  .find({
    year: { $gte: 2000 },
    runtime: { $lte: 120 }
  })
  .toArray();
```

```javascript
db("sample_mflix")
  .collection("movies")
  .find({
    $or: [
      { year: { $lt: 1950 } },
      { runtime: { $gte: 180 } }
    ]
  })
  .toArray();
```

### Challenge

- ค้นหาภาพยนตร์ตั้งแต่ปี 2010 ที่มีความยาวไม่เกิน 120 นาที
- ค้นหาภาพยนตร์ที่ `type` ไม่ใช่ `series` และยังมี Field `runtime`

---

## Lab 4 — Query Nested Document, Array และ String

### วัตถุประสงค์

- ใช้ Dot Notation เพื่อเข้าถึง Nested Document ได้
- ค้นหาข้อมูลภายใน Array ได้อย่างถูกต้อง
- ใช้ Regular Expression เพื่อค้นหาข้อความบางส่วนได้

### เนื้อหาและ Syntax

| หัวข้อ | Syntax หลัก |
|---|---|
| Nested Document | `"imdb.rating"`, `"awards.wins"` |
| Array มีค่าหนึ่งค่า | `{ genres: "Action" }` |
| Array มีครบทุกค่า | `$all` |
| ตรวจสมาชิก Array ด้วยเงื่อนไข | `$elemMatch` |
| ตรวจขนาดและชนิดข้อมูล | `$size`, `$type` |
| ค้นหาข้อความ | `$regex`, `$options` |

### Dot Notation: เข้าถึง Field ที่ซ้อนอยู่

Document ของภาพยนตร์มีโครงสร้างซ้อน เช่น `imdb` เป็น Object ที่มี `rating` อยู่ภายใน จึงต้องเขียนชื่อ Field เต็มเป็น string โดยคั่นแต่ละระดับด้วยจุด

```javascript
// ค้นหา rating ที่อยู่ภายใน imdb
{ "imdb.rating": { $gte: 8 } }

// ค้นหาจำนวนรางวัลชนะที่อยู่ภายใน awards
{ "awards.wins": { $gte: 5 } }
```

### คู่มือการ Query Array

| รูปแบบ | ความหมาย | ตัวอย่าง |
|---|---|---|
| `{ genres: "Action" }` | Array มีค่า `Action` อย่างน้อยหนึ่งสมาชิก | ภาพยนตร์ Action ทั้งหมด |
| `$all` | Array ต้องมีค่าครบทุกค่าที่ระบุ | `{ genres: { $all: ["Action", "Comedy"] } }` |
| `$elemMatch` | มีสมาชิกอย่างน้อยหนึ่งตัวที่ตรงเงื่อนไขภายใน | `{ cast: { $elemMatch: { $regex: "^Tom", $options: "i" } } }` |
| `$size` | Array มีจำนวนสมาชิกเท่ากับที่กำหนดพอดี | `{ genres: { $size: 2 } }` |
| `$type` | ตรวจชนิดข้อมูลของ Field | `{ genres: { $type: "array" } }` |

> `$size` ตรวจได้เฉพาะจำนวนที่ “เท่ากับ” เท่านั้น หากต้องการเปรียบเทียบจำนวนสมาชิก เช่น มากกว่า 2 ค่า จะใช้ `$expr` ร่วมกับ `$size` ซึ่งอยู่ใน Lab 6

### คู่มือการใช้ `$regex` และ `$options`

`$regex` ใช้ค้นหาข้อความด้วยรูปแบบ (pattern) ส่วน `$options` ใช้กำหนดวิธีจับคู่ของ `$regex` และต้องวางใน Object เดียวกับ `$regex`

```javascript
// ชื่อมีคำว่า star โดยไม่สนตัวพิมพ์เล็ก–ใหญ่
{
  title: {
    $regex: "star",
    $options: "i"
  }
}
```

Pattern ที่ใช้บ่อย:

| Pattern | ความหมาย | ตัวอย่าง |
|---|---|---|
| `star` | มีคำว่า star ที่ตำแหน่งใดก็ได้ | `$regex: "star"` |
| `^star` | ขึ้นต้นด้วย star | `$regex: "^star"` |
| `star$` | ลงท้ายด้วย star | `$regex: "star$"` |
| `s.r` | `.` แทนอักขระได้หนึ่งตัว | จับคู่ `star`, `ster` |
| `.*` | อักขระใด ๆ จำนวนศูนย์ตัวหรือมากกว่า | `$regex: "star.*wars"` |

Options ที่ใช้ได้กับ `$regex`:

| Option | ความหมาย | ใช้เมื่อ |
|---|---|---|
| `i` | ไม่สนตัวพิมพ์เล็ก–ใหญ่ | ค้นหา `Star`, `STAR`, `star` ให้ได้ผลเหมือนกัน |
| `m` | ให้ `^` และ `$` ทำงานกับแต่ละบรรทัด | ข้อความมีหลายบรรทัด |
| `s` | ให้ `.` จับคู่ newline ได้ด้วย | Pattern ต้องข้ามบรรทัด |
| `x` | ไม่สนช่องว่างและรองรับ comment ใน pattern | Pattern ซับซ้อนที่ต้องการจัดให้อ่านง่าย |

> สำหรับชื่อภาพยนตร์ ใช้ `$options: "i"` เป็นหลัก ส่วน `m`, `s`, `x` พบได้น้อยกว่าใน Dataset นี้

### หมายเหตุเรื่อง `$text`

`$text` เป็นอีกวิธีสำหรับ Full-text Search แต่ Collection ต้องมี Text Index ก่อน เช่น `{ title: "text", fullplot: "text" }` หากไม่มี Index ให้ใช้ `$regex` ตาม Lab นี้

### ขั้นตอนฝึกปฏิบัติ

1. ค้นหาด้วย Field ซ้อน `imdb.rating`
2. ค้นหาภาพยนตร์ที่มี Genre เดียว
3. ค้นหาภาพยนตร์ที่มีครบหลาย Genre ด้วย `$all`
4. ค้นหาภาพยนตร์ที่มีจำนวน Genre ตามที่กำหนดด้วย `$size`
5. ค้นหาชื่อภาพยนตร์ที่ขึ้นต้นด้วย `The` โดยไม่สนตัวพิมพ์เล็ก–ใหญ่

### ตัวอย่าง Syntax

```javascript
db("sample_mflix")
  .collection("movies")
  .find({
    genres: { $all: ["Action", "Comedy"] },
    "imdb.rating": { $gte: 7 }
  })
  .toArray();
```

```javascript
db("sample_mflix")
  .collection("movies")
  .find({
    title: { $regex: "^the", $options: "i" }
  })
  .toArray();
```

### Challenge

- ค้นหาภาพยนตร์ที่มี Genre `Drama` และ `Romance`
- ค้นหาภาพยนตร์ที่ชื่อมีคำว่า `star` โดยไม่สนตัวพิมพ์เล็ก–ใหญ่

---

## Lab 5 — Projection, Sort และ Pagination

### วัตถุประสงค์

- ลด Field ที่ส่งกลับด้วย Projection
- เรียงข้อมูลด้วยหลาย Field ได้
- แบ่งผลลัพธ์เป็นหน้าโดยใช้ `skip()` และ `limit()` ได้

### เนื้อหาและ Syntax

| หัวข้อ | Syntax หลัก |
|---|---|
| เลือก Field | `project({ field: 1 })` |
| ซ่อน `_id` | `project({ _id: 0, field: 1 })` |
| เรียงน้อยไปมาก / มากไปน้อย | `sort({ field: 1 })`, `sort({ field: -1 })` |
| แบ่งหน้า | `skip()`, `limit()` |

### วิธีใช้ `project()`

`project()` กำหนด Field ที่ต้องการส่งกลับ โดย `1` คือเลือก Field และ `0` คือไม่เลือก Field

```javascript
// Inclusion projection: แสดงเฉพาะ Field ที่ระบุ
.project({
  _id: 0,
  title: 1,
  year: 1,
  "imdb.rating": 1
})
```

> ห้ามผสม `1` และ `0` ใน Projection เดียวกัน ยกเว้น `_id` ที่สามารถกำหนดเป็น `0` ได้เสมอ

### วิธีใช้ `sort()`, `skip()` และ `limit()`

```javascript
// rating มากไปน้อย แล้วปีใหม่ไปเก่าเมื่อ rating เท่ากัน
.sort({ "imdb.rating": -1, year: -1 })

// Pagination: หน้าที่ page, จำนวนรายการต่อหน้า pageSize
// offset = (page - 1) * pageSize
.skip(20)
.limit(10)
```

ควรใช้ลำดับ `find() → project() → sort() → skip() → limit() → toArray()` เพื่อให้อ่าน Query ได้ง่ายและผลลัพธ์ของแต่ละหน้ามีลำดับคงที่

### ขั้นตอนฝึกปฏิบัติ

1. แสดงเฉพาะ `title`, `year` และ `imdb.rating`
2. ซ่อน `_id` จากผลลัพธ์
3. เรียงภาพยนตร์ตาม IMDb rating จากมากไปน้อย
4. ใช้ `year` เป็นลำดับรองเมื่อ rating เท่ากัน
5. แสดงข้อมูลหน้าที่ 1 และหน้าที่ 2 โดยกำหนดขนาดหน้าละ 10 รายการ

### ตัวอย่าง Syntax

```javascript
db("sample_mflix")
  .collection("movies")
  .find({ "imdb.rating": { $exists: true } })
  .project({
    _id: 0,
    title: 1,
    year: 1,
    "imdb.rating": 1
  })
  .sort({ "imdb.rating": -1, year: -1 })
  .limit(10)
  .toArray();
```

### Challenge

- แสดงภาพยนตร์ Genre `Comedy` ตั้งแต่ปี 2010 โดยเลือกเฉพาะชื่อ ปี และ rating
- สร้าง Query สำหรับหน้าที่ 3 เมื่อหน้าแต่ละหน้ามี 20 รายการ

---

## Lab 6 — Aggregation Pipeline เพื่อวิเคราะห์ข้อมูลภาพยนตร์

### วัตถุประสงค์

- เข้าใจการส่ง Document ผ่าน Stage ของ Aggregation Pipeline
- สรุปข้อมูลด้วย `$group` และ Accumulator Operators ได้
- จัดการ Array, สร้าง Field คำนวณ และเชื่อมโยง Collection ได้

### ลำดับการเรียนรู้ภายใน Lab

| ขั้น | หัวข้อ | Syntax หลัก |
|---|---|---|
| 5.1 | Pipeline พื้นฐาน | `aggregate()`, `$match`, `$project`, `$sort`, `$limit` |
| 5.2 | สรุปข้อมูล | `$group`, `$sum`, `$avg`, `$min`, `$max`, `$count` |
| 5.3 | จัดการ Array และ Field คำนวณ | `$unwind`, `$set`, `$addFields`, `$filter`, `$map` |
| 5.4 | Expression และเงื่อนไข | `$expr`, `$cond`, `$ifNull`, `$switch` |
| 5.5 | เชื่อมโยง Collection | `$lookup`, `$unwind`, `$project` |

### พื้นฐานของ Aggregation Pipeline

`aggregate()` รับ Array ของ Stage โดย Document จะไหลผ่าน Stage จากบนลงล่าง ดังนั้นลำดับของ Stage มีผลต่อผลลัพธ์และประสิทธิภาพ

```javascript
db("sample_mflix")
  .collection("movies")
  .aggregate([
    { $match: { year: { $gte: 2000 } } },
    { $project: { _id: 0, title: 1, year: 1 } },
    { $sort: { year: -1 } },
    { $limit: 10 }
  ])
  .toArray();
```

### คู่มือ Stage พื้นฐาน

| Stage | หน้าที่ | รูปแบบใช้งาน |
|---|---|---|
| `$match` | กรอง Document เหมือน Filter ของ `find()` | `{ $match: { year: { $gte: 2000 } } }` |
| `$project` | เลือก ซ่อน เปลี่ยนชื่อ หรือสร้าง Field สำหรับผลลัพธ์ | `{ $project: { title: 1, rating: "$imdb.rating" } }` |
| `$set` / `$addFields` | เพิ่มหรือแทนที่ Field โดยสองชื่อนี้ทำงานเท่ากัน | `{ $set: { isLong: { $gte: ["$runtime", 120] } } }` |
| `$sort` | เรียง Document | `{ $sort: { rating: -1 } }` |
| `$skip` | ข้าม Document ตามจำนวนที่กำหนด | `{ $skip: 20 }` |
| `$limit` | เก็บ Document ตามจำนวนที่กำหนด | `{ $limit: 10 }` |

> ใน Filter ของ `find()` เขียน `{ runtime: { $gte: 120 } }` แต่ใน Aggregation Expression เขียน `{ $gte: ["$runtime", 120] }` เพราะแบบหลังเปรียบเทียบ “ค่า” ที่ถูกส่งเข้า Array

### คู่มือ `$unwind`, `$filter` และ `$map`

`$unwind` เปลี่ยนสมาชิกใน Array ให้เป็น Document แยกกัน เหมาะกับการ Group ตาม Genre หรือ Country

```javascript
// ก่อน $unwind: genres = ["Action", "Comedy"]
// หลัง $unwind: ได้ Document หนึ่งชุดสำหรับ Action และอีกชุดสำหรับ Comedy
{ $unwind: "$genres" }
```

หากต้องการเก็บ Document ที่ไม่มี Array หรือ Array ว่างไว้ ให้ใช้รูปแบบ Object:

```javascript
{
  $unwind: {
    path: "$genres",
    preserveNullAndEmptyArrays: true
  }
}
```

`$filter` คัดเลือกสมาชิกของ Array โดยไม่แยก Document ส่วน `$map` แปลงสมาชิกทุกตัวของ Array เป็นค่าใหม่

```javascript
{
  $set: {
    actionGenres: {
      $filter: {
        input: { $ifNull: ["$genres", []] },
        as: "genre",
        cond: { $eq: ["$$genre", "Action"] }
      }
    }
  }
}
```

```javascript
{
  $set: {
    upperGenres: {
      $map: {
        input: { $ifNull: ["$genres", []] },
        as: "genre",
        in: { $toUpper: "$$genre" }
      }
    }
  }
}
```

ในสองตัวอย่างนี้:

- `input` คือ Array ต้นทาง
- `as: "genre"` ตั้งชื่อตัวแปรสำหรับสมาชิกแต่ละตัว
- `$$genre` คือการอ้างอิงตัวแปรที่ตั้งด้วย `as`
- `cond` เป็นเงื่อนไขของ `$filter`; `in` คือค่าที่ `$map` ส่งกลับต่อสมาชิกหนึ่งตัว

### คู่มือ `$group` และ Accumulator Operators

`$group` รวม Document ที่มีค่า `_id` เดียวกันเป็นกลุ่มใหม่ ค่า `_id` สามารถเป็น Field reference หรือ `null` หากต้องการรวมทั้งหมดเป็นกลุ่มเดียว

```javascript
{
  $group: {
    _id: "$genres",
    movieCount: { $sum: 1 },
    averageRating: { $avg: "$imdb.rating" },
    lowestRating: { $min: "$imdb.rating" },
    highestRating: { $max: "$imdb.rating" }
  }
}
```

| Accumulator | หน้าที่ | ตัวอย่าง |
|---|---|---|
| `$sum` | รวมค่า; ใช้ `$sum: 1` เพื่อนับ Document | `movieCount: { $sum: 1 }` |
| `$avg` | ค่าเฉลี่ยของ Field ตัวเลข | `averageRating: { $avg: "$imdb.rating" }` |
| `$min` | ค่าน้อยที่สุด | `lowestRuntime: { $min: "$runtime" }` |
| `$max` | ค่ามากที่สุด | `longestRuntime: { $max: "$runtime" }` |

`$count` ในรูปแบบ Stage ใช้นับจำนวน Document ทั้งหมดหลังจากผ่าน Stage ก่อนหน้า:

```javascript
[
  { $match: { year: { $gte: 2000 } } },
  { $count: "movieCount" }
]
```

> หากต้องการนับจำนวน “ภายในแต่ละกลุ่ม” ให้ใช้ `{ $sum: 1 }` ใน `$group` เป็นรูปแบบหลักของ Lab นี้

### คู่มือ `$expr`, `$cond`, `$ifNull` และ `$switch`

`$expr` ช่วยให้ใช้ Aggregation Expression ภายใน `$match` ได้ เช่น เปรียบเทียบจำนวนสมาชิกใน Array กับค่าที่กำหนด

```javascript
{
  $match: {
    $expr: {
      $gt: [
        { $size: { $ifNull: ["$genres", []] } },
        2
      ]
    }
  }
}
```

`$cond` ใช้สร้างผลลัพธ์แบบ if/else:

```javascript
{
  $set: {
    runtimeLevel: {
      $cond: [
        { $gte: ["$runtime", 120] },
        "Long",
        "Standard"
      ]
    }
  }
}
```

`$ifNull` ใช้ค่าทดแทนเมื่อ Field ไม่มีอยู่หรือมีค่า `null`:

```javascript
{
  $project: {
    title: 1,
    rating: { $ifNull: ["$imdb.rating", "Not rated"] }
  }
}
```

`$switch` เหมาะกับ if/else หลายระดับ โดย MongoDB ตรวจ `branches` จากบนลงล่างและใช้ `default` เมื่อไม่มีเงื่อนไขใดตรง:

```javascript
{
  $set: {
    ratingLevel: {
      $switch: {
        branches: [
          { case: { $gte: ["$imdb.rating", 8] }, then: "Excellent" },
          { case: { $gte: ["$imdb.rating", 6] }, then: "Good" }
        ],
        default: "Needs improvement or not rated"
      }
    }
  }
}
```

### คู่มือ `$lookup`

`$lookup` คือการเชื่อมข้อมูลระหว่าง Collection ผลลัพธ์ที่ได้จะอยู่ใน Field ที่กำหนดด้วย `as` และมีชนิดเป็น Array เสมอ

```javascript
{
  $lookup: {
    from: "movies",
    localField: "movie_id",
    foreignField: "_id",
    as: "movie"
  }
}
```

หลัง `$lookup` ให้ใช้ `{ $unwind: "$movie" }` เมื่อต้องการเปลี่ยน Array `movie` ให้เป็น Object เดียว เพื่ออ้าง Field ด้วย `$movie.title` ได้สะดวก

รูปแบบ Pipeline ของ `$lookup` ใช้เมื่อเงื่อนไข Join ซับซ้อนขึ้น โดย `let` สร้างตัวแปรจาก Collection หลัก และ `$expr` เปรียบเทียบ Field กับตัวแปรนั้น:

```javascript
{
  $lookup: {
    from: "comments",
    let: { movieId: "$_id" },
    pipeline: [
      {
        $match: {
          $expr: { $eq: ["$movie_id", "$$movieId"] }
        }
      }
    ],
    as: "comments"
  }
}
```

### ขั้นตอนฝึกปฏิบัติ

1. สร้าง Pipeline เพื่อกรองภาพยนตร์ แล้วเลือก Field และเรียงลำดับผลลัพธ์
2. ใช้ `$unwind` เพื่อแยก `genres` ออกมาเป็นหนึ่ง Document ต่อหนึ่ง Genre
3. ใช้ `$group` เพื่อนับจำนวนภาพยนตร์และหาค่าเฉลี่ย rating ของแต่ละ Genre
4. ใช้ `$set` หรือ `$addFields` เพื่อสร้าง Field คำนวณ
5. ใช้ `$cond` หรือ `$switch` เพื่อจัดกลุ่มคะแนน IMDb เป็นระดับ
6. ใช้ `$lookup` เชื่อม `comments.movie_id` กับ `movies._id`

### ตัวอย่าง Pipeline: จำนวนภาพยนตร์และค่าเฉลี่ย Rating ตาม Genre

```javascript
db("sample_mflix")
  .collection("movies")
  .aggregate([
    { $match: { "imdb.rating": { $exists: true } } },
    { $unwind: "$genres" },
    {
      $group: {
        _id: "$genres",
        movieCount: { $sum: 1 },
        averageRating: { $avg: "$imdb.rating" }
      }
    },
    { $sort: { movieCount: -1 } },
    { $limit: 10 }
  ])
  .toArray();
```

### ตัวอย่าง Pipeline: เชื่อมความคิดเห็นกับข้อมูลภาพยนตร์

```javascript
db("sample_mflix")
  .collection("comments")
  .aggregate([
    {
      $lookup: {
        from: "movies",
        localField: "movie_id",
        foreignField: "_id",
        as: "movie"
      }
    },
    { $unwind: "$movie" },
    {
      $project: {
        _id: 0,
        name: 1,
        text: 1,
        date: 1,
        movieTitle: "$movie.title",
        movieYear: "$movie.year"
      }
    },
    { $limit: 10 }
  ])
  .toArray();
```

### Challenge

- สร้าง Top 10 Genre ของภาพยนตร์ตั้งแต่ปี 2000 โดยเรียงตามจำนวนภาพยนตร์
- จัดอันดับประเทศตามจำนวนภาพยนตร์และค่าเฉลี่ย IMDb rating
- หาภาพยนตร์ที่มีจำนวน Comment สูงสุด โดยเชื่อม `comments` กับ `movies`

---

## Lab 7 — Challenge: Movie Analytics

### วัตถุประสงค์

- เลือก MQL syntax ให้เหมาะกับโจทย์
- ออกแบบ Query จากผลลัพธ์ที่ต้องการ
- อธิบายเหตุผลของ Filter, Projection และ Pipeline Stage ที่เลือกใช้

### โจทย์

1. ค้นหาภาพยนตร์หลังปี 2010 ที่มี IMDb rating อย่างน้อย 7.5 และแสดง Top 20 ตาม rating
2. ค้นหาภาพยนตร์ที่เป็นทั้ง `Action` และ `Adventure` พร้อมแสดงเฉพาะชื่อ ปี และรายชื่อนักแสดง
3. สรุปจำนวนภาพยนตร์รายปีตั้งแต่ปี 2000 และเรียงปีจากใหม่ไปเก่า
4. หาจำนวน Comment ต่อภาพยนตร์ แล้วแสดง 10 อันดับแรกพร้อมชื่อภาพยนตร์
5. ออกแบบ Query ของตนเอง 1 ข้อ โดยใช้ข้อมูลจากอย่างน้อย 2 Collection
