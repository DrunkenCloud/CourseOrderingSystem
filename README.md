# Course Ordering System

A comprehensive faculty course preference and elective proposal management system built with Next.js, Prisma, and PostgreSQL.

## Features

### Admin Features
- **Session Management**: Create and manage academic sessions with course and elective limits
- **Course Management**: Add, edit, and delete courses in the catalog
- **Faculty Management**: Manage faculty accounts and positions
- **Preference Review**: View faculty course preferences and elective proposals
- **Elective Approval**: Review and approve/reject elective proposals with course code assignment

### Faculty Features
- **Course Preferences**: Select and rank preferred courses for teaching
- **Elective Proposals**: Propose new elective courses for approval
- **Session-based Limits**: Respect maximum course and elective limits per session
- **Real-time Validation**: Immediate feedback on selections and proposals

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom authentication with bcrypt and localStorage
- **Deployment**: Vercel-ready with automated builds

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd course-ordering-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database connection string
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open http://localhost:3000
   - Admin: `admin@university.edu` / `admin123`
   - Faculty: `john.smith@university.edu` / `faculty123`

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── faculty/           # Faculty pages
│   └── page.tsx           # Login page
├── lib/                   # Utility libraries
├── prisma/                # Database schema and migrations
├── scripts/               # Deployment scripts
└── public/                # Static assets
```

## Database Schema

The system uses the following main entities:
- **Admin**: System administrators
- **Faculty**: Faculty members with positions
- **Position**: Faculty positions with credit requirements
- **Session**: Academic sessions with limits
- **Course**: Course catalog
- **SessionCourse**: Courses available in sessions
- **SessionFaculty**: Faculty assigned to sessions
- **CourseChoice**: Faculty course preferences
- **ElectiveCourse**: Proposed elective courses

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Admin APIs
- `GET/POST /api/admin/sessions` - Session management
- `PUT/DELETE /api/admin/sessions/[id]` - Session operations
- `GET/POST /api/admin/courses` - Course management
- `PUT/DELETE /api/admin/courses/[id]` - Course operations
- `GET/POST /api/admin/faculty` - Faculty management
- `PUT/DELETE /api/admin/faculty/[id]` - Faculty operations
- `GET /api/admin/preferences` - View all preferences
- `GET /api/admin/electives` - View all elective proposals
- `PUT /api/admin/electives/[id]` - Approve/reject electives

### Faculty APIs
- `GET /api/faculty/sessions` - Get assigned sessions
- `POST /api/faculty/preferences` - Submit course preferences
- `GET/POST /api/faculty/electives` - Manage elective proposals
- `PUT/DELETE /api/faculty/electives/[id]` - Edit/delete proposals

## Environment Variables

```bash
DATABASE_URL="postgresql://..."
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data
- `npm run db:studio` - Open Prisma Studio
- `npm run deploy` - Full deployment preparation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md).
For general questions, please open an issue.