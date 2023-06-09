import {shellEnv, shellEnvSync} from 'shell-env';

export async function shellPath() {
	const {PATH} = await shellEnv();
	return PATH;
}

export function shellPathSync() {
	const {PATH} = shellEnvSync();
	return PATH;
}
