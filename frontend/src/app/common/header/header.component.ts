import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { TimerService } from 'src/app/services/timer.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TimerItem } from 'src/app/interfaces/timer-item';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HistoryService } from 'src/app/services/history.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentServer: string = 'Гранас';
  currentRoute: string = '';
  timerList: TimerItem[] = [];
  historyListData: any = [];
  historyList: any = [];

  isOnlineSubscription: Subscription | undefined;
  isOnline: 'online' | 'offline' | undefined;

  serverList = [
    { label: 'Гранас', value: 'Гранас' },
    { label: 'Энигма', value: 'Энигма' },
    { label: 'Логрус', value: 'Логрус' },
  ];

  constructor(
    private router: Router,
    private storageService: StorageService,
    private timerService: TimerService,
    private historyService: HistoryService,
    private authService: AuthService,
    private websocketService: WebsocketService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  setCurrentServer() {
    console.log(this.currentServer);
    this.historyService.setIsLoading(true);
    this.timerService.setIsLoading(true);
    this.storageService.setCurrentServer(this.currentServer);
    this.getHistory();
    this.getAllBosses();
  }

  getCurrentServer() {
    if (this.storageService.getLocalStorage('server')) {
      this.currentServer = this.storageService.getLocalStorage('server');
    }
  }

  getAllBosses(): void {
    this.timerService.getAllBosses(this.currentServer).subscribe({
      next: (res) => {
        this.timerList = [...res];
        this.timerList = this.timerList.sort((a, b) => {
          if (a.mobData.respawnLost && a.mobData.respawnLost == true) return 1;
          if (b.mobData.respawnLost && b.mobData.respawnLost == true) return -1;

          if (a.mobData.respawnTime && b.mobData.respawnTime) {
            return a.mobData.respawnTime > b.mobData.respawnTime ? 1 : -1;
          }

          return 0;
        });

        this.timerService.setTimerList(this.timerList);

        this.timerList.map((item) => {
          item.mob.plusCooldown = 0;
        });
        this.timerService.setIsLoading(false);
      },
    });
  }

  getHistory(): void {
    this.historyService.getHistory(this.currentServer).subscribe({
      next: (res: any) => {
        this.historyListData = res;
        this.historyList = res.data;
        this.historyService.setHistoryList(this.historyList);
        this.historyService.setHistoryListData(this.historyListData);
        this.historyService.setIsLoading(false);
      },
    });
  }

  copyRespText() {
    let data: string[] = [];
    console.log('object', this.timerList);
    this.getCurrentServer();
    this.timerService.getAllBosses(this.currentServer).subscribe({
      next: (res) => {
        this.timerList = [...res];
        this.timerList = this.timerList.sort((a, b) => {
          if (a.mobData.respawnLost && a.mobData.respawnLost == true) return 1;
          if (b.mobData.respawnLost && b.mobData.respawnLost == true) return -1;

          if (a.mobData.respawnTime && b.mobData.respawnTime) {
            return a.mobData.respawnTime > b.mobData.respawnTime ? 1 : -1;
          }

          return 0;
        });
        this.timerList.map((item) => {
          item.mob.plusCooldown = 0;
          if (item.mobData.respawnTime) {
            data.push(
              `${item.mob.shortName} - ${moment(
                item.mobData.respawnTime
              ).format('HH:mm:ss')}`
            );
          }
        });
        this.message.create('success', 'Респы были успешно скопированы');
        navigator.clipboard.writeText(data.join(',\n'));
      },
    });
  }

  showCrashServerModal() {
    this.modal.confirm({
      nzTitle: 'Внимание',
      nzContent:
        '<b>Вы точно хотите переписать все респы с учётом падения сервера?</b>',
      nzOkText: 'Да',
      nzOnOk: () => this.onCrashServer(),
      nzCancelText: 'Нет',
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  onCrashServer() {
    this.getCurrentServer();
    this.timerService.setIsLoading(true);
    console.log(this.currentServer);
    this.timerService.crashServerBosses(this.currentServer).subscribe({
      next: (res) => {
        this.getAllBosses();
        this.message.create('success', 'Респы теперь с учётом падения сервера');
      },
    });
  }

  isLoggedIn(): boolean {
    return this.storageService.isLoggedIn();
  }

  onRegister(): void {
    this.router.navigate(['/register']);
  }

  onLogin(): void {
    this.router.navigate(['/login']);
  }

  showLogoutModal(): void {
    this.modal.confirm({
      nzTitle: 'Внимание',
      nzContent: '<b>Вы точно хотите выйти?</b>',
      nzOkText: 'Да',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.onLogout(),
      nzCancelText: 'Нет',
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  onLogout(): void {
    this.authService.signOut().subscribe({
      next: (res) => {
        this.timerService.setHeaderVisibility(false);
        this.storageService.clean();
        this.onLogin();
      },
    });
  }

  onHistory(): void {
    this.historyService.setIsLoading(true);
    this.router.navigate(['/history']);
  }

  onTimer(): void {
    this.timerService.setIsLoading(true);
    this.router.navigate(['/timer']);
  }

  onProfile(): void {
    this.router.navigate(['/profile']);
  }

  updateRoute(): void {
    this.currentRoute = this.router.url;
  }

  ngOnInit(): void {
    if (this.storageService.getLocalStorage('token')) {
      this.websocketService.connect(
        this.storageService.getLocalStorage('token'),
        this.storageService.getLocalStorage('email')
      );
    }

    this.isOnlineSubscription = this.websocketService
      .getIsOnline()
      .subscribe((res: any) => {
        if (res) {
          console.log('isOnline', res);
          if (this.storageService.getLocalStorage('email') === res.email) {
            this.isOnline = res.status;
          }
        }
      });

    this.isOnlineSubscription = this.websocketService
      .getOnlineUserList()
      .subscribe((res: any) => {
        if (res) {
          console.log('onlineUserList', res);
        }
      });

    this.getCurrentServer();
    this.router.events.subscribe(() => {
      this.updateRoute();
    });
    this.updateRoute();
  }

  ngOnDestroy(): void {
    if (this.isOnlineSubscription) {
      this.isOnlineSubscription.unsubscribe();
    }

    this.websocketService.disconnect();
  }
}
