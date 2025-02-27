import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Required for Toastr
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MoviesComponent } from './movies/movies.component';
import { TopimdbComponent } from './topimdb/topimdb.component';
import { ContactusComponent } from './contactus/contactus.component';
import{HttpClientModule} from '@angular/common/http';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { SearchPipe } from './search.pipe';
import { ViewmoviesComponent } from './viewmovies/viewmovies.component';
import { FooterComponent } from './footer/footer.component';
import{NgxPaginationModule} from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AboutusComponent } from './aboutus/aboutus.component';
import { LoginComponent } from './login/login.component';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { RateusComponent } from './rateus/rateus.component';
import { SeeratingsComponent } from './seeratings/seeratings.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
// import { ResetPasswordComponent } from './reset-password/reset-password.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MoviesComponent,
    TopimdbComponent,
    ContactusComponent,
    PagenotfoundComponent,
    SearchPipe,
    ViewmoviesComponent,
    FooterComponent,
    AboutusComponent,
    LoginComponent,
    UserprofileComponent,
    RateusComponent,
    SeeratingsComponent,
    ForgotPasswordComponent,
    // ResetPasswordComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgxPaginationModule,
    NgbModule,
    BrowserAnimationsModule, 
    ToastrModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
