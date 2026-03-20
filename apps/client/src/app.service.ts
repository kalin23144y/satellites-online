import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
	ping(): { success: boolean } {
		return { success: true }
	}
}
