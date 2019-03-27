import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
interface IPerson { name: String };
interface IToDo { id: number, description: String, assignedTo: String, done: boolean};

export interface DialogData {
  editDescription: string;
  editPerson: string;
  editDone: boolean;
  people: IPerson[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent {
  public todos: IToDo[];
  public people: IPerson[];
  public filter: number = 0;
  public newDescription: String;
  public newPersonName: String;
  public personName: String = "";
  public editDescription: String = "";
  public editPerson: String = "";
  public editDone: String = "";
  
  constructor(private httpClient: HttpClient, public dialog: MatDialog) { 
    
  }

  ngOnInit() {
    this.loadTodos();
    this.loadPeople();
  }

  async loadTodos(){
    this.todos = await this.httpClient
      .get<IToDo[]>('http://localhost:8080/api/todos')
      .toPromise();
    if (this.filter == 2){
      this.todos = this.todos.filter(this.checkUndone);
    }
    if (this.filter == 1){
      this.todos = this.todos.filter(this.checkDone);
    }
    if (this.personName != ""){
      this.todos = this.todos.filter(todo => todo.assignedTo == this.personName);
    }
  }

  async loadPeople(){
    this.people = await this.httpClient
      .get<IPerson[]>('http://localhost:8080/api/people')
      .toPromise();
  }

  async createToDo(){
    await this.httpClient.post('http://localhost:8080/api/todos', {
      "description": this.newDescription,
      "assignedTo": this.newPersonName
    }).toPromise(); 
    this.loadTodos();
  }

  async deleteToDo(id: number){
    await this.httpClient.delete(`http://localhost:8080/api/todos/${id}`).toPromise();
    this.loadTodos();
  }

  public checkUndone(todo: IToDo){
    return !todo.done;
  }

  public checkDone(todo: IToDo){
    return todo.done;
  }

  printTodos(){
    console.log(this.todos);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(EditDialog, {
      data: {editDescription: this.editDescription, editPerson: this.editPerson, editDone: this.editDone, people: this.people}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}

@Component({
  selector: 'editDialog',
  templateUrl: 'editDialog.html',
})
export class EditDialog {

  constructor(
    public dialogRef: MatDialogRef<EditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
