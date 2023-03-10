/* eslint-disable class-methods-use-this */

import organize, { OrganizeResult, TypeOfInteractor } from './organize';

export default class Organizer {
  static organize(): TypeOfInteractor[] {
    return [];
  }

  static perform(context: any = {}): Promise<OrganizeResult> {
    return organize(context, this.organize());
  }
}
