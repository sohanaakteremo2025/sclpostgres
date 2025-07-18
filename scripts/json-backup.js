#!/usr/bin/env node
// scripts/json-backup.js
// disable eslint for this file
/* eslint-disable */
require('dotenv').config()
const path = require('path')
const fs = require('fs')
const { MongoClient } = require('mongodb')

// Create backups directory if it doesn't exist
const backupDir = path.join(process.cwd(), 'json-backups')
if (!fs.existsSync(backupDir)) {
	fs.mkdirSync(backupDir, { recursive: true })
}

// Format date for filename
const getFormattedDate = () => {
	const now = new Date()
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
		2,
		'0',
	)}-${String(now.getDate()).padStart(2, '0')}_${String(
		now.getHours(),
	).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`
}

// Process the connection string to make it suitable for connecting to a specific database
function getDatabaseUri(baseUri, dbName) {
	if (baseUri.includes('mongodb+srv://')) {
		const parts = baseUri.split('/')
		const hostPart = parts.slice(0, 3).join('/')
		const paramsPart =
			parts[3] && parts[3].includes('?') ? '?' + parts[3].split('?')[1] : ''
		return `${hostPart}/${dbName}${paramsPart}`
	} else {
		const url = new URL(baseUri)
		url.pathname = `/${dbName}`
		return url.toString()
	}
}

// Get all collections from a database and export to JSON
async function exportDatabaseToJson(client, dbName, outputPath) {
	const db = client.db(dbName)
	const collections = await db.listCollections().toArray()

	const dbData = {
		database: dbName,
		exportedAt: new Date().toISOString(),
		collections: {},
	}

	for (const collectionInfo of collections) {
		const collectionName = collectionInfo.name
		// Skip system collections
		if (collectionName.startsWith('system.')) continue

		const collection = db.collection(collectionName)
		const documents = await collection.find().toArray()

		// Convert ObjectId to string for JSON serialization
		const convertedDocs = documents.map(doc => {
			const converted = { ...doc }
			if (converted._id) {
				converted._id = converted._id.toString()
			}
			return converted
		})

		dbData.collections[collectionName] = convertedDocs
		console.log(
			`  - Exported ${convertedDocs.length} documents from ${collectionName}`,
		)
	}

	// Write to JSON file
	fs.writeFileSync(outputPath, JSON.stringify(dbData, null, 2))
	console.log(`✅ Database ${dbName} exported to ${outputPath}`)
}

async function main() {
	const start = Date.now()
	const timestamp = getFormattedDate()

	// Get MongoDB connection details from .env
	const mongoUrl = process.env.DATABASE_URL
	if (!mongoUrl) {
		console.error('DATABASE_URL not found in environment variables')
		process.exit(1)
	}

	// Create session directory
	const sessionDir = path.join(backupDir, `backup_${timestamp}`)
	if (!fs.existsSync(sessionDir)) {
		fs.mkdirSync(sessionDir)
	}

	// Connect to MongoDB
	const adminUri = getDatabaseUri(mongoUrl, 'admin')
	const client = new MongoClient(adminUri)

	try {
		await client.connect()
		console.log('Connected to MongoDB')

		// Get all databases
		const dbs = await client.db().admin().listDatabases()
		const userDbs = dbs.databases.filter(
			db => !['admin', 'local', 'config'].includes(db.name),
		)

		console.log(`Found ${userDbs.length} user databases to backup:`)

		for (const dbInfo of userDbs) {
			const dbName = dbInfo.name
			const outputPath = path.join(sessionDir, `${dbName}.json`)

			console.log(`\nBacking up ${dbName}...`)
			await exportDatabaseToJson(client, dbName, outputPath)
		}

		// Create summary file
		const summary = {
			timestamp,
			totalDatabases: userDbs.length,
			databases: userDbs.map(db => db.name),
		}
		fs.writeFileSync(
			path.join(sessionDir, 'backup_summary.json'),
			JSON.stringify(summary, null, 2),
		)

		console.log('\nBackup completed successfully!')
		console.log(`Backup files saved to: ${sessionDir}`)
	} catch (error) {
		console.error('Backup failed:', error)
		process.exit(1)
	} finally {
		await client.close()
		console.log(
			`Total time: ${((Date.now() - start) / 1000).toFixed(1)} seconds`,
		)
	}
}

main()
