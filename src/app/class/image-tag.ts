import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { ObjectStore } from './core/synchronize-object/object-store';
import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';

import { EventSystem, Network } from './core/system';
import { StringUtil } from './core/system/util/string-util';

@SyncObject('image-tag')
export class ImageTag extends ObjectNode {
  @SyncVar() imageIdentifier: string = '';
  @SyncVar() tag: string = '';
  @SyncVar() hide:boolean = false;

  get words(): string[] {
    if (this.tag == null) this.tag = '';
    if (this.tag.trim() === '') return [];
    return this.tag.trim().split(/\s+/);
  }

  containsWords(words: string, isOr: boolean): boolean
  containsWords(words: string[], isOr: boolean): boolean
  containsWords(words: any, isOr=true): boolean {
    if (typeof words === 'string') words = words.trim().split(/\s+/);
    words = words.concat();
    let temp = this.words;
    if (isOr) {
      for (const word of words) {
        if (temp.includes(word)) return true;
      }
      return false;
    } else {
      if (words.length == 0) return false;
      for (const word of words) {
        if (!temp.includes(word)) return false;
      }
      return true;
    }
  }

  addWords(words: string): string[] 
  addWords(words: string[]): string[] 
  addWords(words: any): string[] {
    if (typeof words === 'string') words = words.trim().split(/\s+/);
    words = words.concat();
    const addingWords = Array.from(new Set<string>(words.map(word => StringUtil.toHalfWidth(word).toLowerCase())));
    words.push(...this.words);
    this.tag = Array.from(new Set(words.map(word => StringUtil.toHalfWidth(word).toLowerCase()))).sort().join(' ');
    EventSystem.call('OPERATE_IMAGE_TAGS', { tag: this.tag });
    return addingWords;
  }

  removeWords(words: string): string[]
  removeWords(words: string[]): string[]
  removeWords(words: any): string[] {
    if (typeof words === 'string') words = words.trim().split(/\s+/);
    words = words.concat();
    const delteingingWords = Array.from(new Set<string>(words.map(word => StringUtil.toHalfWidth(word).toLowerCase())));
    this.tag = this.words.filter(word => !delteingingWords.includes(StringUtil.toHalfWidth(word).toLowerCase())).sort().join(' ');
    EventSystem.call('OPERATE_IMAGE_TAGS', { tag: this.tag });
    return delteingingWords;
  }

  static get(imageIdentifier: string): ImageTag {
    return ObjectStore.instance.get<ImageTag>(`imagetag_${imageIdentifier}`);
  }

  static create(imageIdentifier: string) {
    const object = new ImageTag(`imagetag_${imageIdentifier}`);
    object.imageIdentifier = imageIdentifier;
    object.initialize();
    return object;
  }

  parseInnerXml(element: Element) {
    // 既存のオブジェクトを更新する
    let imageTag = ImageTag.get(this.imageIdentifier);
    if (!imageTag) imageTag = ImageTag.create(this.imageIdentifier);
    const context = imageTag.toContext();
    context.syncData = this.toContext().syncData;
    imageTag.apply(context);
    imageTag.update();
    this.destroy();
  }
}