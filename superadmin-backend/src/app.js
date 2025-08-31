require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

//login routes
const authRoutes = require('./routes/login');
app.use('/api/v1/auth', authRoutes);

//users route
const userRoutes = require('./routes/users');
app.use('/api/v1/superadmin/users', userRoutes);

//roles route
const rolesRouter = require("./routes/roles");
app.use("/api/v1/superadmin/roles", rolesRouter);

//analytics routes
const analyticsRouter = require("./routes/analytics");
app.use("/api/v1/superadmin/analytics", analyticsRouter);



//audit routes
const auditLogsRouter = require("./routes/auditLogs");
app.use("/api/v1/superadmin/audit-logs", auditLogsRouter);



module.exports = app;
