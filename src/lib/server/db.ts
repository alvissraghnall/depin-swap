import mongoose from 'mongoose';
import { MONGODB_URI } from '$env/static/private';

enum MongoConnection {
	UNINITIALIZED = 99,
	CONNECTING = 2,
	CONNECTED = 1,
	DISCONNECTING = 3,
	DISCONNECTED = 0
}

const mongoConnection = {
	isConnected: MongoConnection.DISCONNECTED
};

export const connectDB = async () => {
	console.log('MONGODB_URI', MONGODB_URI);
	if (mongoConnection.isConnected === 1) {
		console.log('Connected!');
		return;
	}

	if (mongoose.connections.length > 0) {
		mongoConnection.isConnected = mongoose.connections[0].readyState.valueOf();
		if (mongoConnection.isConnected === 1) {
			console.log('Connection already exists!');
			return;
		}

		await mongoose.disconnect();
	}
	await mongoose.connect(MONGODB_URI ?? '', { dbName: 'depin-swap' });
	mongoConnection.isConnected = 1;
	console.log('connected to mongodb:', MONGODB_URI ?? '');
};

export const disconnectDB = async () => {
	if (process.env.NODE_ENV === 'development') return;
	if (mongoConnection.isConnected === 0) return;

	await mongoose.disconnect();
	mongoConnection.isConnected = 0;
	console.log('disconnected from mongodb');
};
