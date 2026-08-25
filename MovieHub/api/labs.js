import { ObjectId } from "mongodb";

/*
 * STUDENT FILE
 *
 * แก้เฉพาะ function ในไฟล์นี้เท่านั้น
 * Starter code ใช้ mock/empty result เพื่อให้ server และ UI ยังเปิดได้
 * ห้ามเปลี่ยนชื่อ function, parameters หรือรูปแบบข้อมูลที่ return
 */

/*
 * TODO 1 — Register
 *
 * เป้าหมาย: บันทึก userDocument ลง usersCollection และ return User พร้อม _id
 *
 * Guide:
 * 1. ใช้ usersCollection.insertOne(userDocument)
 * 2. insertOne() return object ที่มี insertedId
 * 3. รวม userDocument กับ insertedId แล้ว return เป็น User document
 *
 * ตัวอย่างโครง:
 * const result = await usersCollection.insertOne(userDocument);
 * return { ...userDocument, _id: result.insertedId };
 *
 * วิธีตรวจ: Register แล้วต้องพบ User ใหม่ใน moviehub.users
 */
export async function registerUser(usersCollection, userDocument) {
  void usersCollection;

  return {
    ...userDocument,
    _id: new ObjectId()
  };
}

/*
 * TODO 2 — Login และ Current session
 *
 * เป้าหมาย: ค้นหา User 1 คนตาม filter และ return User หรือ null
 * Function นี้ถูกเรียก 2 รูปแบบ:
 * - Login ส่ง filter เป็น { email }
 * - Current session ส่ง filter เป็น { _id } พร้อม projection ใน options
 *
 * Guide:
 * 1. ใช้ usersCollection.findOne(filter, options)
 * 2. ส่ง options ต่อให้ MongoDB เพื่อให้ projection ทำงาน
 * 3. ไม่ต้องเขียน if แยกระหว่าง email และ _id เพราะ filter ถูกเตรียมไว้แล้ว
 *
 * ตัวอย่างโครง:
 * const user = await usersCollection.findOne(filter, options);
 * return user;
 *
 * วิธีตรวจ: Sign out แล้ว Sign in ด้วย Account จาก TODO 1 และ Refresh ได้โดย Session ไม่หาย
 */
export async function findUser(usersCollection, filter, options = {}) {
  void usersCollection;
  void options;

  if (filter?._id) {
    return {
      _id: filter._id,
      name: "MovieHub User",
      email: "user@moviehub.local"
    };
  }

  return null;
}

/*
 * TODO 3 — Dashboard
 *
 * เป้าหมาย: Query ค่าสรุปทั้งหมดแล้ว return object สำหรับ Dashboard
 *
 * Guide:
 * 1. ใช้ countDocuments() นับ Movie และ Comment
 * 2. ใช้ aggregate() ร่วมกับ $match และ $group เพื่อหา Average rating/runtime
 * 3. Top Genres ใช้ $unwind, $group, $sort, $limit และ $project
 * 4. Top Movies ใช้ find(), project(), sort(), limit() และ toArray()
 * 5. งานแต่ละชุดไม่ขึ้นต่อกัน จึงใช้ Promise.all() ให้ Query พร้อมกันได้
 * 6. ค่า aggregate เป็น Array ให้ตรวจ element แรกก่อนอ่านผล
 *
 * ตัวอย่าง Pipeline สำหรับค่าเฉลี่ย:
 * [
 *   { $match: { fieldName: { $type: "number" } } },
 *   { $group: { _id: null, average: { $avg: "$fieldName" } } }
 * ]
 *
 * Return shape ห้ามเปลี่ยน:
 * {
 *   metrics: { totalMovies, ratedMovies, averageRating, totalComments, averageRuntime },
 *   topGenres: [],
 *   topMovies: []
 * }
 *
 * วิธีตรวจ: Dashboard ต้องมีตัวเลขจริง, Genre 6 รายการ และ Top Movies 6 รายการ
 */
export async function getDashboardData(moviesCollection, commentsCollection) {
  void moviesCollection;
  void commentsCollection;

  return {
    metrics: {
      totalMovies: 0,
      ratedMovies: 0,
      averageRating: 0,
      totalComments: 0,
      averageRuntime: 0
    },
    topGenres: [],
    topMovies: []
  };
}

/*
 * TODO 4 — Movie list, Search, Filter, Sort และ Pagination
 *
 * เป้าหมาย: Query รายการ Movie และ return Pagination result
 * queryOptions มี { filter, projection, sort, page, limit }
 *
 * Guide:
 * 1. คำนวณจำนวนที่ข้ามด้วย (page - 1) * limit
 * 2. ใช้ countDocuments(filter) เพื่อหาจำนวนทั้งหมด
 * 3. สร้าง Cursor ด้วย find(filter)
 * 4. ต่อ project(), sort(), skip(), limit() และ toArray() ตามลำดับ
 * 5. ใช้ Promise.all() เรียก count และ list พร้อมกัน
 * 6. คำนวณ totalPages ด้วย Math.ceil(total / limit) และกำหนดอย่างน้อย 1 หน้า
 *
 * ตัวอย่างโครง Cursor:
 * moviesCollection
 *   .find(filter)
 *   .project(projection)
 *   .sort(sort)
 *   .skip(skip)
 *   .limit(limit)
 *   .toArray();
 *
 * Return shape ห้ามเปลี่ยน:
 * { items, page, limit, total, totalPages }
 *
 * วิธีตรวจ: Search, Genre, Rating, Sort และ Previous/Next ต้องเปลี่ยนรายการบนหน้า Movies
 */
export async function listMovies(moviesCollection, queryOptions) {
  void moviesCollection;

  return {
    items: [],
    page: queryOptions.page,
    limit: queryOptions.limit,
    total: 0,
    totalPages: 1
  };
}

/*
 * TODO 5 — Movie detail
 *
 * เป้าหมาย: ค้นหา Movie จาก ObjectId และ return Movie หรือ null
 *
 * Guide:
 * 1. ใช้ moviesCollection.findOne()
 * 2. MongoDB ใช้ field _id เป็นรหัสหลักของ Document
 * 3. movieObjectId ถูกแปลงเป็น ObjectId จาก server.js แล้ว ไม่ต้องแปลงซ้ำ
 *
 * ตัวอย่างโครง:
 * const movie = await moviesCollection.findOne({ _id: movieObjectId });
 * return movie;
 *
 * วิธีตรวจ: กด Edit ที่ Movie ของตนเองแล้ว Form ต้องแสดงข้อมูลเดิม
 */
export async function findMovieById(moviesCollection, movieObjectId) {
  void moviesCollection;
  void movieObjectId;

  return null;
}

/*
 * TODO 6 — Create movie
 *
 * เป้าหมาย: เพิ่ม Movie แล้ว return Document ที่สร้างสำเร็จพร้อม _id
 *
 * Guide:
 * 1. ใช้ moviesCollection.insertOne(movieDocument)
 * 2. อ่าน insertedId จากผลลัพธ์
 * 3. จะรวม movieDocument กับ insertedId หรือ findOne() ข้อมูลที่เพิ่งสร้างก็ได้
 *
 * ตัวอย่างโครง:
 * const result = await moviesCollection.insertOne(movieDocument);
 * return { ...movieDocument, _id: result.insertedId };
 *
 * วิธีตรวจ: Add movie แล้วต้องพบ Document ใหม่ทั้งในหน้า Movies และ Atlas
 */
export async function createMovie(moviesCollection, movieDocument) {
  void moviesCollection;

  return {
    ...movieDocument,
    _id: new ObjectId()
  };
}

/*
 * TODO 7 — Update movie
 *
 * เป้าหมาย: แก้ไข Movie และ return Document หลังอัปเดต หรือ null
 * filter มีทั้ง _id และ createdBy เพื่อป้องกันการแก้ Movie ของผู้อื่น
 *
 * Guide:
 * 1. ใช้ moviesCollection.findOneAndUpdate()
 * 2. ใช้ $set กับ updateFields เพื่อแก้เฉพาะ Field ที่ส่งมา
 * 3. กำหนด returnDocument: "after" เพื่อรับค่าหลังอัปเดต
 * 4. MongoDB Driver รุ่นนี้ใช้ includeResultMetadata: false เพื่อ return Document โดยตรง
 *
 * ตัวอย่างโครง:
 * const movie = await moviesCollection.findOneAndUpdate(
 *   filter,
 *   { $set: updateFields },
 *   { returnDocument: "after", includeResultMetadata: false }
 * );
 * return movie;
 *
 * วิธีตรวจ: แก้ Runtime หรือ Genre แล้วเปิด Edit ซ้ำ ต้องเห็นค่าใหม่
 */
export async function updateMovie(moviesCollection, filter, updateFields) {
  void moviesCollection;
  void filter;
  void updateFields;

  return null;
}

/*
 * TODO 8 — Delete movie
 *
 * เป้าหมาย: ลบ Movie ที่ตรงกับ filter และ return จำนวน Document ที่ลบ
 * filter มีทั้ง _id และ createdBy เพื่อให้ลบได้เฉพาะ Movie ของ Account ปัจจุบัน
 *
 * Guide:
 * 1. ใช้ moviesCollection.deleteOne(filter)
 * 2. deleteOne() return Result object
 * 3. อ่าน deletedCount แล้ว return เฉพาะตัวเลขให้ Route
 *
 * ตัวอย่างโครง:
 * const result = await moviesCollection.deleteOne(filter);
 * return result.deletedCount;
 *
 * วิธีตรวจ: Delete Movie ที่สร้างเองแล้วต้องค้นหาไม่พบในหน้า Movies และ Atlas
 */
export async function deleteMovie(moviesCollection, filter) {
  void moviesCollection;
  void filter;

  return 0;
}
