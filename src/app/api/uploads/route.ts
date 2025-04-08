import { NextRequest, NextResponse } from 'next/server';

import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create the uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate a unique filename with safe characters
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const uniqueFilename = `${timestamp}-${safeName}`;
        const filePath = path.join(uploadDir, uniqueFilename);

        // Write the file to the public directory
        await writeFile(filePath, buffer);

        // Return the path relative to the public directory
        // Important: No leading slash for Next.js static file serving

        return NextResponse.json({
            success: true,
            filePath: `uploads/${uniqueFilename}`
        });
    } catch (error) {
        console.error('Error uploading file:', error);

        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const deleteAll = searchParams.get('delete_all');

        if (deleteAll === 'true') {
            // Delete all files in the uploads directory
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');

            // Check if directory exists before attempting to delete files
            if (existsSync(uploadDir)) {
                const fs = await import('fs/promises');
                const files = await fs.readdir(uploadDir);

                // Delete each file in the directory
                const deletePromises = files.map((file) =>
                    fs
                        .unlink(path.join(uploadDir, file))
                        .catch((err) => console.error(`Failed to delete ${file}:`, err))
                );

                await Promise.all(deletePromises);
            }

            return NextResponse.json({ success: true });
        }

        const filepath = searchParams.get('filepath');

        if (!filepath) {
            return NextResponse.json({ error: 'No filepath provided' }, { status: 400 });
        }

        // Make sure the filepath is within the uploads directory (for security)
        const filename = path.basename(filepath);
        const targetPath = path.join(process.cwd(), 'public', 'uploads', filename);

        try {
            await import('fs/promises').then((fs) => fs.unlink(targetPath));

            return NextResponse.json({ success: true });
        } catch (err) {
            // If file doesn't exist, it's still a successful deletion

            return NextResponse.json({ success: true, message: 'File already deleted or does not exist' });
        }
    } catch (error) {
        console.error('Error deleting file:', error);

        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
}
