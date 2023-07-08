import { Globals } from '../services/globals';
import { Project } from './project';
import { Section } from './section';
export class Site {
  static parseObject(resultJson: any): Site {
    let result = {} as any;
    Object.keys(resultJson).forEach((key) => {
      result[key.toLowerCase()] = resultJson[key];
    });
    let newSite = new Site(result['id'], result['sitename']);
    newSite.siteWebsite = result['sitewebsite'];
    newSite.siteDescription = result['sitedescription'];
    if (result['startsection']) {
      newSite.startSection = Section.parseObject(result['startsection']);
    }
    return newSite;
  }
  id: string | null;
  siteName: string | null;
  siteWebsite?: string | null;
  siteDescription?: string | null;
  startSection?: Section;
  projects?: Project[];
  fakeId = Globals.getFakeId();


  constructor(id: string | null, siteName: string | null) {
    this.id = id;
    this.siteName = siteName;
  }

  get link(): string {
    return 'create-site?siteid=' + this.id;
  }

}
