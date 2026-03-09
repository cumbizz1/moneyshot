import { Injectable } from '@nestjs/common';

import {
  AGES, BODY_TYPES, BUTTS, ETHNICITIES, EYES, GENDERS,
  HAIRS, HEIGHTS, PUBIC_HAIRS, SEXUAL_ORIENTATIONS, WEIGHTS
} from '../constants';

@Injectable()
export class UserAdditionalInfoService {
  private info;

  public getBodyInfo() {
    if (this.info) return this.info;
    this.info = {
      heights: HEIGHTS,
      weights: WEIGHTS,
      ages: AGES,
      butts: BUTTS,
      eyes: EYES,
      ethnicities: ETHNICITIES,
      genders: GENDERS,
      hairs: HAIRS,
      pubicHairs: PUBIC_HAIRS,
      bodyTypes: BODY_TYPES,
      sexualOrientations: SEXUAL_ORIENTATIONS
    };
    return this.info;
  }
}
