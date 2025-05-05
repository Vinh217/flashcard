import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  const filePath = path.join(DATA_DIR, `custom-${email}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json([]); // Nếu chưa có file thì trả về mảng rỗng
  }
}

export async function POST(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  const filePath = path.join(DATA_DIR, `custom-${email}.json`);
  const body = await req.json();
  let data = [];
  try {
    const file = await fs.readFile(filePath, 'utf-8');
    data = JSON.parse(file);
  } catch {}
  data.push(body);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return NextResponse.json({ success: true });
} 