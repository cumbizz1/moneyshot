import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';

import { MENU_SECTION } from '../constants';

export class MenuSearchRequestPayload extends SearchRequest {
  title?: string;

  public?: boolean;

  internal?: boolean;

  @ApiProperty()
  @IsString()
  @IsIn([MENU_SECTION.MAIN, MENU_SECTION.HEADER, MENU_SECTION.FOOTER])
  @IsOptional()
    section: string;

  constructor(options?: Partial<MenuSearchRequestPayload>) {
    super(options);

    this.title = options?.title;
    this.public = options?.public;
    this.internal = options?.internal;
    this.section = options?.section;
  }
}
