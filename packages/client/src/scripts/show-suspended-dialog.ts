import * as os from '@/os';
import { i18n } from '@/i18n';

export function showSuspendedDialog() {
	return os.alert({
		type: 'error',
		title: i18n.locale.yourAccountSuspendedTitle,
		text: i18n.locale.yourAccountSuspendedDescription
	});
}
