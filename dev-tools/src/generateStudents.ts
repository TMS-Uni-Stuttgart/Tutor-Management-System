import Axios from 'axios';
import { LoggedInUser } from 'shared/src/model/User';
import { StudentDTO, StudentStatus, Student } from 'shared/src/model/Student';
import { TutorialDTO, Tutorial } from 'shared/src/model/Tutorial';

function createBaseURL(): string {
  return 'http://localhost:8080/api';
}

const axios = Axios.create({
  baseURL: createBaseURL(),
  // withCredentials: true,
  withCredentials: true,
  headers: {
    // This header prevents the spring backend to add a header which will make a popup appear if the credentials are wrong.
    'X-Requested-With': 'XMLHttpRequest',
  },
  // Configure to use auth every time bc node can not save cookies.
  // auth: {
  //   username: 'admin',
  //   password: 'admin',
  // },
});

const cookies: string[] = [];

async function login(username: string, password: string): Promise<void> {
  // We build the Authorization header by ourselfs because the axios library does NOT use UTF-8 to encode the string as base64.
  const encodedAuth = Buffer.from(username + ':' + password, 'utf8').toString('base64');
  const response = await axios.post<LoggedInUser>('/login', null, {
    headers: {
      Authorization: `Basic ${encodedAuth}`,
    },
    // Override the behaviour of checking the response status to not be 401 (session timed out)
    validateStatus: () => true,
  });

  const [cookie] = response.headers['set-cookie'] || [undefined];

  if (cookie) {
    cookies.push(cookie);

    axios.defaults.headers.Cookie = cookie;
  }
}

async function run() {
  try {
    await login('admin', 'admin');

    const tutorialDTO: TutorialDTO = {
      slot: 'G1',
      startTime: '09:45:00',
      endTime: '11:15:00',
      dates: [new Date().toDateString(), new Date().toDateString()],
      correctorIds: [],
    };

    const tutorialResponse = await axios.post<Tutorial>('/tutorial', tutorialDTO);

    if (tutorialResponse.status !== 201) {
      throw new Error('Tutorial could not be created.');
    }

    for (let i = 0; i < 600; i++) {
      const studentDTO: StudentDTO = {
        firstname: 'Test',
        lastname: `Student #${i.toString().padStart(2, '0')}`,
        status: StudentStatus.ACTIVE,
        tutorial: tutorialResponse.data.id,
        // TODO: Rest of properties?
      };

      await axios.post<Student>('/student', studentDTO);

      if (i % 50 === 0) {
        console.log(`Generated students #${i}`);
      }
    }

    console.log('All students created.');
  } catch (err) {
    console.log(err);
  }
}

run();
