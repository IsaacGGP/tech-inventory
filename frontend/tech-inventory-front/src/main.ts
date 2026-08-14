import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { AuthService } from './app/core/services/auth/auth.service';

bootstrapApplication(App, appConfig)
  .then((componentRef) => {
    componentRef.injector.get(AuthService).checkAuthentication();
  })
  .catch((err) => console.error(err));
