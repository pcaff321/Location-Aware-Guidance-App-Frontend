import { MapService } from './../services/beaconClickService';
import { HttpService } from './../services/httpService';
import { ActiveService } from './../services/activeService';
import { Section } from './../models/section';
import { SiteMap } from './../models/siteMap';
import { Globals } from './../services/globals';
import { Hint } from './../models/hint';
import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-hints',
  templateUrl: './hints.component.html',
  styleUrls: ['./hints.component.scss'],
})
export class HintsComponent implements OnInit, AfterViewInit {
updateX($event: Event) {
  if (!this.activeHint) {
    return;
  }
  this.activeHint.x = Number(($event.target as HTMLInputElement).value);
  this.mapService.updateClickMap();
}
updateY($event: Event) {
  if (!this.activeHint) {
    return;
  }
  this.activeHint.y = Number(($event.target as HTMLInputElement).value);
  this.mapService.updateClickMap();
}

  activeSection?: Section;
  activeHint?: Hint;
  hints: Hint[] = [];

  constructor(private activeService: ActiveService,
    private httpService : HttpService,
    private mapService: MapService) {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.activeService.activeSection.subscribe((section) => {
      if (section) {
        this.httpService.getHintsOfSection(section).subscribe((data) => {
          this.activeSection = section;
          this.hints = data;
          if (this.hints.length > 0) {
            this.activeHint = this.hints[0];
          }
        });
      }
    });
    this.mapService.latestClick.subscribe((click) => {
      if (this.activeHint) {
        this.activeHint.x = click[0];
        this.activeHint.y = click[1];
        this.mapService.updateClickMap();
      }
    });
  }

  updateHintText($event: Event) {
    this.activeHint!.hintText = ($event.target as HTMLInputElement).value;
  }

  updateHintImage($event: Event) {
    if (!this.activeHint) {
      return;
    }
    let hintImage = ($event.target as HTMLInputElement).files![0];
    Globals.toBase64(hintImage).then((data) => {
      this.activeHint!.hintImage = data as string;
      this.activeHint!.contentType = hintImage.type;
    });
  }

  updateHintName($event: Event) {
    this.activeHint!.name = ($event.target as HTMLInputElement).value;
  }

  addHint() {
    if (!this.activeSection) {
      return;
    }
    let newHint = new Hint(0, 'New Hint', this.activeSection!.innerMap!);
    this.hints.push(newHint);
    this.activeHint = newHint;
    this.activeSection!.hints = this.hints;
    this.mapService.updateClickMap();
  }

  selectHint(arg0: number) {
    console.log(arg0);
    let chosenHint = this.hints.find((hint) => hint.fakeId === arg0);
    if (chosenHint) {
      this.activeHint = chosenHint;
    }
  }

  removeHint() {
    if (!this.activeHint) {
      return;
    }
    this.hints = this.hints.filter((hint) => hint.id !== this.activeHint!.id);
    this.activeSection!.hints = this.hints;
    if (this.hints.length > 0) {
      this.activeHint = this.hints[0];
    } else {
      this.activeHint = undefined;
    }
    this.mapService.updateClickMap();
  }
}
