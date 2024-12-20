from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import get_db
from app.schema.project_schema import Projectcreate, GetProject
from app.crud.project_crud import create_project, get_projects

projectroutes = APIRouter()

@projectroutes.post("/")
async def createproject(projectdata: Projectcreate,  db: AsyncSession = Depends(get_db)):
    try:
        print("Here we go")
        print(projectdata)
        title= projectdata.title
        userid=projectdata.userid
        Description=projectdata.Description
        Img=projectdata.Img
        project = await create_project(db=db, title=title, userid=userid, Description=Description, Img=Img)
        return {"msg": "Project created", "project_info": project}
    except Exception as e:
        print("Error creating project:", str(e))
        raise HTTPException(status_code=500, detail="Server error")

@projectroutes.get("/")
async def getproject(userid: int, db: AsyncSession = Depends(get_db)):
    proje= await get_projects(db=db, userid=userid)
    print(proje)
    return {"User": userid , "Projects": proje}

