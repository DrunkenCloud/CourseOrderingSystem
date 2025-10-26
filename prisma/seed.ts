import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seeding...')

    // Create Admin users
    const adminPassword = await bcrypt.hash('admin123', 10)

    const admin1 = await prisma.admin.upsert({
        where: { email: 'admin@university.edu' },
        update: {},
        create: {
            name: 'System Administrator',
            email: 'admin@university.edu',
            password: adminPassword,
        },
    })

    const admin2 = await prisma.admin.upsert({
        where: { email: 'dean@university.edu' },
        update: {},
        create: {
            name: 'Academic Dean',
            email: 'dean@university.edu',
            password: adminPassword,
        },
    })

    console.log('✅ Created admin users:', { admin1: admin1.email, admin2: admin2.email })

    // Create Positions
    const positions = [
        { name: 'Professor', details: 'Senior faculty position', minCredits: 12 },
        { name: 'Associate Professor', details: 'Mid-level faculty position', minCredits: 15 },
        { name: 'Assistant Professor', details: 'Junior faculty position', minCredits: 18 },
        { name: 'Lecturer', details: 'Teaching-focused position', minCredits: 20 },
    ]

    const createdPositions = []
    for (const position of positions) {
        const pos = await prisma.position.upsert({
            where: { name: position.name },
            update: {},
            create: position,
        })
        createdPositions.push(pos)
    }

    console.log('✅ Created positions:', createdPositions.map(p => p.name))

    // Create Faculty users
    const facultyPassword = await bcrypt.hash('faculty123', 10)

    const faculty = [
        {
            name: 'Dr. John Smith',
            email: 'john.smith@university.edu',
            password: facultyPassword,
            positionId: createdPositions[0].id, // Professor
        },
        {
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@university.edu',
            password: facultyPassword,
            positionId: createdPositions[1].id, // Associate Professor
        },
        {
            name: 'Dr. Michael Brown',
            email: 'michael.brown@university.edu',
            password: facultyPassword,
            positionId: createdPositions[2].id, // Assistant Professor
        },
        {
            name: 'Prof. Emily Davis',
            email: 'emily.davis@university.edu',
            password: facultyPassword,
            positionId: createdPositions[3].id, // Lecturer
        },
    ]

    const createdFaculty = []
    for (const fac of faculty) {
        const f = await prisma.faculty.upsert({
            where: { email: fac.email },
            update: {},
            create: fac,
        })
        createdFaculty.push(f)
    }

    console.log('✅ Created faculty:', createdFaculty.map(f => f.email))

    // Create Courses
    const courses = [
        {
            courseName: 'Introduction to Computer Science',
            courseCode: 'CS101',
            details: 'Basic programming concepts and problem solving',
            credits: 3,
            isElective: false,
        },
        {
            courseName: 'Data Structures and Algorithms',
            courseCode: 'CS201',
            details: 'Fundamental data structures and algorithmic thinking',
            credits: 4,
            isElective: false,
        },
        {
            courseName: 'Database Systems',
            courseCode: 'CS301',
            details: 'Relational databases and SQL',
            credits: 3,
            isElective: false,
        },
        {
            courseName: 'Web Development',
            courseCode: 'CS302',
            details: 'Modern web technologies and frameworks',
            credits: 3,
            isElective: true,
        },
        {
            courseName: 'Machine Learning',
            courseCode: 'CS401',
            details: 'Introduction to ML algorithms and applications',
            credits: 4,
            isElective: true,
        },
        {
            courseName: 'Software Engineering',
            courseCode: 'CS303',
            details: 'Software development lifecycle and best practices',
            credits: 3,
            isElective: false,
        },
    ]

    const createdCourses = []
    for (const course of courses) {
        const c = await prisma.course.upsert({
            where: { courseCode: course.courseCode },
            update: {},
            create: course,
        })
        createdCourses.push(c)
    }

    console.log('✅ Created courses:', createdCourses.map(c => c.courseCode))

    // Create Sessions
    const session1 = await prisma.session.upsert({
        where: { id: 'session-1' },
        update: {},
        create: {
            id: 'session-1',
            name: 'Fall 2024 Course Assignment',
            details: 'Faculty course preferences for Fall 2024 semester',
            isActive: true,
            maxCourses: 4,
        },
    })

    const session2 = await prisma.session.upsert({
        where: { id: 'session-2' },
        update: {},
        create: {
            id: 'session-2',
            name: 'Spring 2025 Course Assignment',
            details: 'Faculty course preferences for Spring 2025 semester',
            isActive: false,
            maxCourses: 3,
        },
    })

    console.log('✅ Created sessions:', [session1.name, session2.name])

    // Add courses to sessions
    for (const course of createdCourses) {
        await prisma.sessionCourse.upsert({
            where: {
                sessionId_courseId: {
                    sessionId: session1.id,
                    courseId: course.id,
                },
            },
            update: {},
            create: {
                sessionId: session1.id,
                courseId: course.id,
            },
        })
    }

    // Add first 4 courses to session 2
    for (let i = 0; i < 4; i++) {
        await prisma.sessionCourse.upsert({
            where: {
                sessionId_courseId: {
                    sessionId: session2.id,
                    courseId: createdCourses[i].id,
                },
            },
            update: {},
            create: {
                sessionId: session2.id,
                courseId: createdCourses[i].id,
            },
        })
    }

    console.log('✅ Added courses to sessions')

    // Add faculty to sessions
    for (const fac of createdFaculty) {
        await prisma.sessionFaculty.upsert({
            where: {
                sessionId_facultyId: {
                    sessionId: session1.id,
                    facultyId: fac.id,
                },
            },
            update: {},
            create: {
                sessionId: session1.id,
                facultyId: fac.id,
            },
        })
    }

    console.log('✅ Added faculty to sessions')

    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('Admin: admin@university.edu / admin123')
    console.log('Admin: dean@university.edu / admin123')
    console.log('Faculty: john.smith@university.edu / faculty123')
    console.log('Faculty: sarah.johnson@university.edu / faculty123')
    console.log('Faculty: michael.brown@university.edu / faculty123')
    console.log('Faculty: emily.davis@university.edu / faculty123')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })