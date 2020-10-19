import { Component, Input, OnInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { UUID } from '@udonarium/core/system/util/uuid';
import { DataElement } from '@udonarium/data-element';
import { StandConditionType } from '@udonarium/stand-list';
import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { ModalService } from 'service/modal.service';

@Component({
  selector: 'stand-element',
  templateUrl: './stand-element.component.html',
  styleUrls: ['./stand-element.component.css']
})
export class StandElementComponent implements OnInit {
  @Input() standElement: DataElement = null;
  @Input() imageList: ImageFile[] = [];

  private _imageFile: ImageFile = ImageFile.Empty;

  standConditionType = StandConditionType;

  constructor(
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
  }

  get standImage(): ImageFile {
    if (!this.standElement) return this._imageFile;
    let elm = this.standElement.getFirstElementByName('imageIdentifier');
    if (elm) {
      if (this._imageFile.identifier !== elm.value) { 
        let file: ImageFile = ImageStorage.instance.get(<string>elm.value);
        this._imageFile = file ? file : ImageFile.Empty;
      }
    } else {
      let fileContext = ImageFile.createEmpty('stand_no_image').toContext();
      fileContext.url = './assets/images/nc96424.png';
      this._imageFile = ImageStorage.instance.add(fileContext);
      this.standElement.appendChild(DataElement.create('imageIdentifier', this._imageFile.identifier, { type: 'image' }, 'imageIdentifier_' + this.standElement.identifier));
    }
    return this._imageFile;
  }

  get nameElement(): DataElement {
    if (!this.standElement) return null;
    let elm = this.standElement.getFirstElementByName('name');
    return elm ? elm : <DataElement>this.standElement.appendChild(DataElement.create('name', '', { }, 'name_' + this.standElement.identifier));
  }

  get conditionTypeElement(): DataElement {
    if (!this.standElement) return null;
    let elm = this.standElement.getFirstElementByName('conditionType');
    return elm ? elm : <DataElement>this.standElement.appendChild(DataElement.create('conditionType', StandConditionType.Default, { }, 'conditionType_' + this.standElement.identifier));
  }

  get postfixElement(): DataElement {
    if (!this.standElement) return null;
    let elm = this.standElement.getFirstElementByName('postfix');
    return elm ? elm : <DataElement>this.standElement.appendChild(DataElement.create('postfix', '', { }, 'postfix_' + this.standElement.identifier));
  }
 
  /*
  get targetImageIdentifierElement(): DataElement {
    if (!this.standElement) return null;
    let elm = this.standElement.getFirstElementByName('targetImageIdentifier');
    return elm ? elm : <DataElement>this.standElement.appendChild(DataElement.create('targetImageIdentifier', '', { }, 'targetImageIdentifier_' + this.standElement.identifier));
  }
  */

  get positionElement(): DataElement {
    if (!this.standElement) return null;
    let elm = this.standElement.getFirstElementByName('position');
    return elm ? elm : <DataElement>this.standElement.appendChild(DataElement.create('position', 0, { 'currentValue': '' }, 'position_' + this.standElement.identifier));
  }

  openModal() {
    if (!this.standElement) return;
    let elm = this.standElement.getFirstElementByName('imageIdentifier');
    if (!elm) {
      elm = <DataElement>this.standElement.appendChild(DataElement.create('imageIdentifier', '', { type: 'image' }, 'imageIdentifier_' + this.standElement.identifier));
    }
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: false }).then(value => {
      if (!value) return;
      elm.value = value;
    });
  }
 
  remove() {
    if (!this.standElement) return;
    this.standElement.parent.removeChild(this.standElement);
  }

  selectImage(identifier) {
    if (!this.standElement) return;
    let isSelected = false;
    for (let elm of this.standElement.getElementsByName('targetImageIdentifier')) {
      let isNothing = true;
      for (let image of this.imageList) {
        if (image.identifier == elm.value) {
          isNothing = false;
          break;
        }
      }
      if (isNothing) {
        this.standElement.removeChild(elm);
      } else if (elm.value == identifier) {
        isSelected = true;
        this.standElement.removeChild(elm);
      }
    }
    if (!isSelected) {
      this.standElement.appendChild(DataElement.create('targetImageIdentifier', identifier, { }, 'targetImageIdentifier_' + UUID.generateUuid()));
    }
  }

  isSelectedImage(identifier) {
    let elms = this.standElement.getElementsByName('targetImageIdentifier');
    for (let elm of elms) {
      if (elm.value == identifier) return true;
    }
    return false;
  }
}
