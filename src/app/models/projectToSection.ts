import { Globals } from "../services/globals";
import { Project } from "./project";
import { Section } from "./section";
export class ProjectToSection {
    static removeProjectFromSection(project: Project, arg1: Section) {
        this.cache = this.cache.filter((projectToSection) => projectToSection.project.id != project.id && projectToSection.section.id != arg1.id);
    }
    static cache : ProjectToSection[] = [];

    id: string;
    project: Project;
    section: Section;
    x?: number;
    y?: number;
    fakeId: number = Globals.getFakeId();

    constructor(id: string, project: Project, section: Section, x?: number, y?: number) {
        this.id = id;
        this.project = project;
        this.section = section;
        this.x = x;
        this.y = y;
        if (this.id == null || this.id == undefined || this.id == '' || parseInt(this.id) < 1) {
            this.id = (this.fakeId * -1).toString();
        }
        if (ProjectToSection.cache.find((projectToSection) => projectToSection.id == this.id || projectToSection.fakeId == this.fakeId) == null) {
            ProjectToSection.cache.push(this);
        }
    }

    static parseObject(resultJson: any): ProjectToSection {
        let result = {} as any;
        Object.keys(resultJson).forEach((key) => {
            result[key.toLowerCase()] = resultJson[key];
        });
        var project = Project.parseObject(result['project']);
        var section = Section.parseObject(result['section']);
        if (result['id'] == null || result['id'] == undefined || result['id'] == '' || parseInt(result['id']) < 1) {
            result['id'] = (Globals.getFakeId() * -1).toString();
        }
        let newProjectToSection = ProjectToSection.cache.find((projectToSection) => projectToSection.id == result['id']);
        if (newProjectToSection == null || newProjectToSection == undefined) {
            newProjectToSection = ProjectToSection.cache.find((projectToSection) => projectToSection.section == section && projectToSection.project == project);
        }
        if (newProjectToSection == null || newProjectToSection == undefined) {
            newProjectToSection = new ProjectToSection(result['id'], project, section, result['x'], result['y']);
            if (newProjectToSection.id == null || newProjectToSection.id == undefined || newProjectToSection.id == ''
             || parseInt(newProjectToSection.id) < 1){
                newProjectToSection.id = (newProjectToSection.fakeId * -1).toString();
            }
            ProjectToSection.cache.push(newProjectToSection);
        } else {
            newProjectToSection.project = project;
            newProjectToSection.section = section;
            if (result['x'] != null && result['x'] != undefined && newProjectToSection.x != result['x'] && result['x'] != 0) {
                newProjectToSection.x = result['x'];
            }
            if (result['y'] != null && result['y'] != undefined && newProjectToSection.y != result['y'] && result['y'] != 0) {
                newProjectToSection.y = result['y'];
            }
        }
        return newProjectToSection;
    }
}
