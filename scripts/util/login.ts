import Axios, { AxiosInstance } from 'axios';
import { ILoggedInUser } from 'shared/model/User';

function createBaseURL(): string {
    return 'http://localhost:8080/api';
}

const cookies: string[] = [];

export async function login(username: string, password: string): Promise<AxiosInstance> {
    const axios = Axios.create({
        baseURL: createBaseURL(),
        withCredentials: true,
        headers: {
            // This header prevents the spring backend to add a header which will make a popup appear if the credentials are wrong.
            'X-Requested-With': 'XMLHttpRequest',
        },
        validateStatus: () => true,
        timeout: 30 * 60 * 1000, // 30 min
    });
    const response = await axios.post<ILoggedInUser>(
        '/auth/login',
        { username, password },
        {
            // Override the behaviour of checking the response status to not be 401 (session timed out)
            validateStatus: () => true,
        }
    );

    if (response.status !== 200) {
        throw new Error(`Login failed -- ${response.status}: ${response.statusText}`);
    }

    const [cookie] = response.headers['set-cookie'] || [undefined];

    if (cookie) {
        cookies.push(cookie);

        axios.defaults.headers.Cookie = cookie;
    }

    return axios;
}
