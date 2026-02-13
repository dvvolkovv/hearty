"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt_1 = require("bcrypt");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var password, admin, specialistsData, specialists, _i, specialistsData_1, data, user, today, times, _a, specialists_1, user, dayOffset, date, availableTimes, _b, availableTimes_1, time, clientsData, clients, _c, clientsData_1, data, user, reviewTexts, _d, specialists_2, specialistUser, reviewCount, i, randomClient, rating;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log('🌱 Seeding database...');
                    return [4 /*yield*/, bcrypt_1.default.hash('password123', 10)
                        // ========================================
                        // 1. Создаем админа
                        // ========================================
                    ];
                case 1:
                    password = _e.sent();
                    // ========================================
                    // 1. Создаем админа
                    // ========================================
                    console.log('👤 Creating admin...');
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@hearty.pro' },
                            update: {},
                            create: {
                                email: 'admin@hearty.pro',
                                passwordHash: password,
                                role: 'ADMIN',
                                status: 'ACTIVE',
                                emailVerified: true,
                                firstName: 'Admin',
                                lastName: 'Hearty'
                            }
                        })];
                case 2:
                    admin = _e.sent();
                    console.log('   ✓ Admin created');
                    // ========================================
                    // 2. Создаем специалистов
                    // ========================================
                    console.log('🧑‍⚕️ Creating specialists...');
                    specialistsData = [
                        {
                            email: 'anna.petrova@hearty.pro',
                            firstName: 'Анна',
                            lastName: 'Петрова',
                            name: 'Анна Петрова',
                            specialty: 'Психолог, гештальт-терапевт',
                            description: 'Помогаю разобраться в отношениях и найти внутренний баланс',
                            fullDescription: 'Работаю с темами: отношения, самооценка, тревога, выгорание. Использую гештальт-подход и элементы когнитивно-поведенческой терапии.',
                            education: ['МГУ, факультет психологии', 'Московский институт гештальта'],
                            certifications: ['Сертификат гештальт-терапевта'],
                            experience: 7,
                            price: 400000,
                            location: 'Москва',
                            format: ['Онлайн', 'Лично'],
                            tags: ['Гештальт', 'Отношения', 'Тревога'],
                            phone: '+7 999 123-45-67',
                            rating: 4.8,
                            totalReviews: 24,
                        },
                        {
                            email: 'dmitry.sokolov@hearty.pro',
                            firstName: 'Дмитрий',
                            lastName: 'Соколов',
                            name: 'Дмитрий Соколов',
                            specialty: 'Карьерный коуч',
                            description: 'Помогаю найти призвание и построить успешную карьеру',
                            fullDescription: 'Специализируюсь на карьерном консультировании и профессиональном развитии.',
                            education: ['ВШЭ, экономический факультет'],
                            certifications: ['ACC ICF'],
                            experience: 5,
                            price: 500000,
                            location: 'Санкт-Петербург',
                            format: ['Онлайн'],
                            tags: ['Карьера', 'Призвание', 'Развитие'],
                            phone: '+7 999 234-56-78',
                            rating: 4.9,
                            totalReviews: 18,
                        },
                        {
                            email: 'elena.smirnova@hearty.pro',
                            firstName: 'Елена',
                            lastName: 'Смирнова',
                            name: 'Елена Смирнова',
                            specialty: 'Клинический психолог, КПТ-терапевт',
                            description: 'Работаю с тревожными расстройствами и депрессией',
                            fullDescription: 'Специализируюсь на когнитивно-поведенческой терапии. Помогаю справиться с тревогой и депрессией.',
                            education: ['СПбГУ, клиническая психология'],
                            certifications: ['Сертифицированный КПТ-терапевт'],
                            experience: 10,
                            price: 600000,
                            location: 'Санкт-Петербург',
                            format: ['Онлайн', 'Лично'],
                            tags: ['КПТ', 'Тревога', 'Депрессия'],
                            phone: '+7 999 345-67-89',
                            rating: 5.0,
                            totalReviews: 42,
                        },
                        {
                            email: 'maria.ivanova@hearty.pro',
                            firstName: 'Мария',
                            lastName: 'Иванова',
                            name: 'Мария Иванова',
                            specialty: 'Семейный психолог',
                            description: 'Помогаю семьям наладить отношения',
                            fullDescription: 'Работаю с семейными парами, помогаю восстановить доверие и наладить коммуникацию.',
                            education: ['МГУ, семейная психология'],
                            certifications: ['Сертификат семейного психолога'],
                            experience: 8,
                            price: 450000,
                            location: 'Москва',
                            format: ['Онлайн', 'Лично'],
                            tags: ['Семья', 'Пары', 'Отношения'],
                            phone: '+7 999 456-78-90',
                            rating: 4.7,
                            totalReviews: 31,
                        },
                        {
                            email: 'alexey.volkov@hearty.pro',
                            firstName: 'Алексей',
                            lastName: 'Волков',
                            name: 'Алексей Волков',
                            specialty: 'Лайф-коуч, бизнес-консультант',
                            description: 'Помогаю достигать целей и раскрывать потенциал',
                            fullDescription: 'Работаю с предпринимателями и руководителями.',
                            education: ['МГИМО, международные отношения'],
                            certifications: ['PCC ICF'],
                            experience: 12,
                            price: 800000,
                            location: 'Москва',
                            format: ['Онлайн', 'Лично'],
                            tags: ['Лидерство', 'Цели', 'Бизнес'],
                            phone: '+7 999 567-89-01',
                            rating: 4.9,
                            totalReviews: 28,
                        },
                        {
                            email: 'olga.novikova@hearty.pro',
                            firstName: 'Ольга',
                            lastName: 'Новикова',
                            name: 'Ольга Новикова',
                            specialty: 'Психолог, арт-терапевт',
                            description: 'Использую творчество для работы с эмоциями',
                            fullDescription: 'Работаю через арт-терапию и телесно-ориентированные практики.',
                            education: ['МГППУ, психология'],
                            certifications: ['Арт-терапевт'],
                            experience: 6,
                            price: 350000,
                            location: 'Казань',
                            format: ['Онлайн'],
                            tags: ['Арт-терапия', 'Творчество', 'Травма'],
                            phone: '+7 999 678-90-12',
                            rating: 4.6,
                            totalReviews: 19,
                        },
                    ];
                    specialists = [];
                    _i = 0, specialistsData_1 = specialistsData;
                    _e.label = 3;
                case 3:
                    if (!(_i < specialistsData_1.length)) return [3 /*break*/, 6];
                    data = specialistsData_1[_i];
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: data.email },
                            update: {},
                            create: {
                                email: data.email,
                                passwordHash: password,
                                role: 'SPECIALIST',
                                status: 'ACTIVE',
                                emailVerified: true,
                                firstName: data.firstName,
                                lastName: data.lastName,
                                specialist: {
                                    create: {
                                        name: data.name,
                                        specialty: data.specialty,
                                        description: data.description,
                                        fullDescription: data.fullDescription,
                                        education: data.education,
                                        certifications: data.certifications,
                                        experience: data.experience,
                                        price: data.price,
                                        location: data.location,
                                        format: data.format,
                                        tags: data.tags,
                                        phone: data.phone,
                                        status: 'APPROVED',
                                        rating: data.rating,
                                        totalReviews: data.totalReviews,
                                    }
                                }
                            },
                            include: { specialist: true }
                        })];
                case 4:
                    user = _e.sent();
                    specialists.push(user);
                    console.log("   \u2713 ".concat(data.name));
                    _e.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    // ========================================
                    // 3. Создаем временные слоты
                    // ========================================
                    console.log('📅 Creating time slots...');
                    today = new Date();
                    times = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
                    _a = 0, specialists_1 = specialists;
                    _e.label = 7;
                case 7:
                    if (!(_a < specialists_1.length)) return [3 /*break*/, 14];
                    user = specialists_1[_a];
                    if (!user.specialist)
                        return [3 /*break*/, 13];
                    dayOffset = 0;
                    _e.label = 8;
                case 8:
                    if (!(dayOffset < 14)) return [3 /*break*/, 13];
                    date = new Date(today);
                    date.setDate(date.getDate() + dayOffset);
                    availableTimes = times.filter(function () { return Math.random() > 0.5; });
                    _b = 0, availableTimes_1 = availableTimes;
                    _e.label = 9;
                case 9:
                    if (!(_b < availableTimes_1.length)) return [3 /*break*/, 12];
                    time = availableTimes_1[_b];
                    return [4 /*yield*/, prisma.timeSlot.create({
                            data: {
                                specialistId: user.specialist.id,
                                date: date,
                                time: time,
                                isBooked: false,
                            },
                        })];
                case 10:
                    _e.sent();
                    _e.label = 11;
                case 11:
                    _b++;
                    return [3 /*break*/, 9];
                case 12:
                    dayOffset++;
                    return [3 /*break*/, 8];
                case 13:
                    _a++;
                    return [3 /*break*/, 7];
                case 14:
                    console.log('   ✓ Time slots created');
                    // ========================================
                    // 4. Создаем клиентов
                    // ========================================
                    console.log('👥 Creating clients...');
                    clientsData = [
                        { email: 'ivan.client@example.com', firstName: 'Иван', lastName: 'Сидоров', name: 'Иван Сидоров' },
                        { email: 'maria.client@example.com', firstName: 'Мария', lastName: 'Кузнецова', name: 'Мария Кузнецова' },
                        { email: 'peter.client@example.com', firstName: 'Петр', lastName: 'Васильев', name: 'Петр Васильев' },
                    ];
                    clients = [];
                    _c = 0, clientsData_1 = clientsData;
                    _e.label = 15;
                case 15:
                    if (!(_c < clientsData_1.length)) return [3 /*break*/, 18];
                    data = clientsData_1[_c];
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: data.email },
                            update: {},
                            create: {
                                email: data.email,
                                passwordHash: password,
                                role: 'CLIENT',
                                status: 'ACTIVE',
                                emailVerified: true,
                                firstName: data.firstName,
                                lastName: data.lastName,
                                client: {
                                    create: { name: data.name }
                                }
                            },
                            include: { client: true }
                        })];
                case 16:
                    user = _e.sent();
                    clients.push(user);
                    console.log("   \u2713 ".concat(data.name));
                    _e.label = 17;
                case 17:
                    _c++;
                    return [3 /*break*/, 15];
                case 18:
                    // ========================================
                    // 5. Создаем отзывы
                    // ========================================
                    console.log('⭐ Creating reviews...');
                    reviewTexts = [
                        'Отличный специалист! Помог разобраться в сложной ситуации.',
                        'Очень профессиональный подход. Рекомендую!',
                        'Благодарю за поддержку и понимание.',
                        'Конкретные инструменты и четкая структура работы.',
                        'Чуткий и внимательный психолог.',
                    ];
                    _d = 0, specialists_2 = specialists;
                    _e.label = 19;
                case 19:
                    if (!(_d < specialists_2.length)) return [3 /*break*/, 24];
                    specialistUser = specialists_2[_d];
                    if (!specialistUser.specialist)
                        return [3 /*break*/, 23];
                    reviewCount = Math.floor(Math.random() * 3) + 2;
                    i = 0;
                    _e.label = 20;
                case 20:
                    if (!(i < reviewCount)) return [3 /*break*/, 23];
                    randomClient = clients[Math.floor(Math.random() * clients.length)];
                    if (!randomClient.client)
                        return [3 /*break*/, 22];
                    rating = Math.random() > 0.3 ? 5 : 4;
                    return [4 /*yield*/, prisma.review.create({
                            data: {
                                clientId: randomClient.client.id,
                                specialistId: specialistUser.specialist.id,
                                rating: rating,
                                text: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
                                status: 'APPROVED',
                            },
                        })];
                case 21:
                    _e.sent();
                    _e.label = 22;
                case 22:
                    i++;
                    return [3 /*break*/, 20];
                case 23:
                    _d++;
                    return [3 /*break*/, 19];
                case 24:
                    console.log('   ✓ Reviews created');
                    console.log('\n✅ Seeding completed!');
                    console.log('\n📝 Test credentials:');
                    console.log('   Admin: admin@hearty.pro / password123');
                    console.log('   Specialist: anna.petrova@hearty.pro / password123');
                    console.log('   Client: ivan.client@example.com / password123');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
