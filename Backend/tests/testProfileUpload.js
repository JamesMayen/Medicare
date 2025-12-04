import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:5000/api/auth';

// Create a temporary test image file

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal 1x1 pixel PNG as base64
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

// Create a temporary file
const tempFilePath = path.join(__dirname, 'test-image.png');
fs.writeFileSync(tempFilePath, minimalPNG);

async function testProfileUpload() {
  try {
    console.log('🧪 Testing Profile Upload API...\n');

    // Step 1: Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'patient'
      }),
    });

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      if (registerData.message === 'User already exists') {
        console.log('   User already exists, proceeding to login...');
      } else {
        throw new Error(`Registration failed: ${registerData.message}`);
      }
    } else {
      console.log('   ✅ User registered successfully');
    }

    // Step 2: Login to get token
    console.log('2. Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData.message}`);
    }

    const token = loginData.token;
    console.log('   ✅ Login successful, got token');

    // Step 3: Create FormData with test image file
    console.log('3. Preparing FormData with test image...');
    const form = new FormData();
    form.append('profilePhoto', fs.createReadStream(tempFilePath), {
      filename: 'test-profile.png',
      contentType: 'image/png',
    });

    // Step 4: Upload profile photo
    console.log('4. Uploading profile photo...');
    const uploadResponse = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadData.message}`);
    }

    if (!uploadData.profilePhoto) {
      throw new Error('Profile photo not uploaded');
    }
    console.log('   ✅ Profile photo uploaded successfully!');
    console.log('   📸 Profile photo URL:', uploadData.profilePhoto);

    // Step 5: Verify the upload by getting profile
    console.log('5. Verifying upload by fetching profile...');
    const profileResponse = await fetch(`${BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      throw new Error(`Profile fetch failed: ${profileData.message}`);
    }

    if (!profileData.profilePhoto) {
      throw new Error('Profile photo not found in profile response');
    }
    console.log('   ✅ Profile photo verified in user profile');
    console.log('   📸 Stored profile photo path:', profileData.profilePhoto);

    console.log('\n🎉 All tests passed! Profile upload API is working correctly.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testProfileUpload();