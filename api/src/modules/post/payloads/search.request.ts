import { ApiProperty } from '@nestjs/swagger';
import { SearchRequest } from 'src/kernel';

export class AdminSearch extends SearchRequest {
  @ApiProperty()
    status?: string;

  @ApiProperty()
    type = 'post';

  constructor(options?: Partial<AdminSearch>) {
    super(options);

    this.status = options?.status;
    this.type = options?.type;
  }
}

export class UserSearch extends SearchRequest {
  @ApiProperty()
    type = 'post';

  constructor(options?: Partial<UserSearch>) {
    super(options);

    this.type = options?.type;
  }
}
