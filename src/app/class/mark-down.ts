import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  HostListener,
} from '@angular/core';
import { DataElement } from '@udonarium/data-element';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameCharacter } from '@udonarium/game-character';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { GameObject } from './core/synchronize-object/game-object';

@SyncObject('markdown')
export class MarkDown extends GameObject {

  changeMarkDownCheckBox(cliskId, dubleCountCheck){
    let match = cliskId.match(/^(.*)_mark_(\d{8})$/);
    console.log("HostListeneronclick event id " + cliskId);

    if(!match) return;
    
    let parentId = match[1];
    let boxNum = match[2];

    let object = ObjectStore.instance.get<DataElement>(parentId);
    
    if (!object)return;

    console.log('object.currentValue     :' + object.currentValue);

    if(dubleCountCheck){
      if( object.currentValue == 0){
        object.currentValue = 1;
      }else{
        object.currentValue = 0;
        return;
      }
    }else{
      object.currentValue = 0;
    }

    let objectValue :string = <string>object.value;
    console.log("HostListeneronclick text = " + objectValue);

    let clickIndex = parseInt(boxNum);
    console.log("clickIndex = " + clickIndex);

    let splitText = objectValue.split(/[\[［][xXｘＸ]?[\]］]/g);
    let matchText = objectValue.match(/[\[［][xXｘＸ]?[\]］]/g);

    let changeText = matchText[clickIndex];

    if( changeText.match(/[\[［][xXｘＸ][\]］]/)){
      changeText = '[]';
    }else{
      changeText = '[x]';
    }

    let newText = '';
    let i
    for( i=0; i < matchText.length; i++){
      if( i != clickIndex){
        newText += splitText[i] + matchText[i];
      }else{
        newText += splitText[i] + changeText;
      }
    }
    for( ; i < splitText.length; i++){
      newText += splitText[i];
    }

    console.log('newText' + newText);

    object.value = newText;
  }

  markDownTable(text){
    let splitLine = text.split('\n');
    let textOut = '';

    let tableMaking = false;
    for( let i = 0; i < splitLine.length; i++){
      let splitVar = splitLine[i].split(/[|｜]/);
      console.log("テーブル"  + splitLine[i] + ' splitVar.length :' + splitVar.length);
      if (splitVar.length == 1){
        if (tableMaking == false){
          textOut += splitLine[i];
        }else{
          textOut += "</div>\n";
          textOut += splitLine[i];
          tableMaking = false;
        }
      }else{
        if (tableMaking == false){
          textOut += splitVar[0];
          textOut += "<div class=\"markdown_table\" style=\"display: table; table-layout: fixed; border: 1px solid #000000;\">"
          textOut += "  <div class=\"markdown_table_row\" style=\"display: table-row; border: 1px solid #000000;\">";
          for( let j = 1; j < splitVar.length - 1; j++){
            textOut += "    <div class=\"markdown_table_cell\" style=\"display: table-cell; border: 1px solid #000000;\">" + splitVar[j] + "</div>";
          }
          textOut += "  </div>";
          tableMaking = true;
        }else{
          textOut += "  <div class=\"markdown_table_row\" style=\"display: table-row; border: 1px solid #000000;\">";
          for( let j = 1; j < splitVar.length - 1; j++){
            textOut += "    <div class=\"markdown_table_cell\" style=\"display: table-cell; border: 1px solid #000000;\">" + splitVar[j] + "</div>";
          }
          textOut += "  </div>";
        }
      }
    }
    if (tableMaking == true){
      textOut += "</div>\n";
    }
  return textOut;
  }

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
  }

}
