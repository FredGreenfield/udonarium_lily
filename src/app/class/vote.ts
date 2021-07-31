import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject, ObjectContext } from './core/synchronize-object/game-object';
import { EventSystem } from './core/system';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

import { ModalService } from 'service/modal.service';

import { PeerCursor } from '@udonarium/peer-cursor';
import { PeerContext, IPeerContext } from '@udonarium/core/system/network/peer-context';

export interface VoteContext {
  peerId: string;
  answer: number;// ���[�I������index�l�A-1:�����[�A-2:����
}

@SyncObject('Vote')
export class Vote extends GameObject {

  @SyncVar() initTimeStamp = 0;
  @SyncVar() question: string = '';
  @SyncVar() voteAnswer: VoteContext[] = [];
  @SyncVar() lastVotePeerId = '';
  @SyncVar() choices: string[] = [];
  @SyncVar() chairId: string = '';
  @SyncVar() isRollCall = false;

  makeVote(chairId : string ,question: string, targetPeerId: string[], choices: string[], isRollCall: boolean){
    this.isRollCall = isRollCall;
    this.chairId = chairId;
    this.question = question;
    this.choices = choices;

    this.voteAnswer = [];
    for( let target of targetPeerId){
      let vote: VoteContext = {
        peerId: target,
        answer: -1,
      }
      this.voteAnswer.push(vote);
    }
    this.lastVotePeerId = '';
    this.initTimeStamp = Date.now();
  }

  isVoteEnd(peerId: string): boolean{
    let ans = this.answerById(peerId);
    if(!ans) return true;

    return ans.answer != -1 ? true : false;
  }

  voting(choice: string | null, peerId: string){
    let ans = this.answerById(peerId);
    if(choice){
      ans.answer = this.choices.indexOf(choice);
    }else{
      ans.answer = -2;
    }
    // �z��v�f�̒��g�̍X�V���Ɠ������s���Ȃ��̂ŒP��ϐ����X�V���ăg���K�[����
    this.lastVotePeerId = peerId;
  }

  answerById(peerId:string): VoteContext{
    for(let ans of this.voteAnswer){
      if(ans.peerId == peerId )return ans;
    }
    return null;
  }

  votedTotalNum(): number{
    const answer: VoteContext[] = this.voteAnswer;
    let count = 0;
    for( let ans of answer){
      if( ans.answer >= 0 || ans.answer == -2){count++ ;}
    }
    return count;
  }

  votedNumByIndex(index: number): number{
    const answer: VoteContext[] = this.voteAnswer;
    let count = 0;
    for( let ans of answer){
      if( ans.answer == index){count++ ;}
    }
    return count;
  }

  votedNumByChoice(choice: string): number{
    const index = this.choices.indexOf(choice);
    return this.votedNumByIndex(index);
  }

  indexToChoice(index: number): string{
    if(index < 0)return '';
    if(index >= this.choices.length )return '';
    return this.choices[index];
  }

  chkToMe():boolean{
    for( let one of this.voteAnswer){
      if(PeerCursor.myCursor.peerId == one.peerId )return true;
    }
    return false;
  }

  startVote(){
    EventSystem.trigger('END_OLD_VOTE', { });
    EventSystem.trigger('START_VOTE', { });
  }

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
  }

  // override
  apply(context: ObjectContext) {

    console.log('Vote apply() CALL');

    const initTimeStamp = this.initTimeStamp;
    super.apply(context);

    if ( initTimeStamp !== this.initTimeStamp ){
      this.startVote();
    }

  }
}
