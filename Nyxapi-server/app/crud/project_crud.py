from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.future import select
from app.models.user import Project, User, Usage  # Use the correct model name
from fastapi import HTTPException
from app.crud.usage_crud import fetch_projects_quant
import random

# Helper function to generate a random 6-digit number
def generate_random_six_digit():
    return random.randint(100000, 999999)

# Function to create a new project
async def create_project(db: AsyncSession, title: str, userid: int, Description: str, Img: str):
    try:
        # Create a new Project instance
        print(title,userid,Description,Img)
        project = Project(
            Projectid=generate_random_six_digit(),  # Assuming this function exists
            Title=title,
            UserID=userid,
            Description=Description,
            Img=Img
        )
        db.add(project)  # Add the project to the session
        await db.commit()  # Commit the transaction
        await db.refresh(project)  # Refresh the project instance with the latest data

        # Fetch current usage for the given userid
        quant = await fetch_projects_quant(db=db, userid=userid)
        
        if quant:  # If a usage record exists, update it
            quant.Project += 1  # Increment the Project count
            # Update other fields as necessary
            await db.commit()
            await db.refresh(quant)
        else:  # If no usage record exists, handle accordingly
            raise HTTPException(status_code=404, detail="No usage record found for the given user")

        return project  # Return the created project
    except SQLAlchemyError as e:
        await db.rollback()  # Rollback the transaction in case of error
        raise HTTPException(status_code=400, detail=f"Error creating project: {str(e)}")
     
# Function to get all projects for a specific user
async def get_projects(db: AsyncSession, userid: int):
    try:
        # Query to select all projects where the UserID matches the given user id
        query = select(Project).filter(Project.UserID == userid)  # Corrected to use the 'Project' model
        result = await db.execute(query)

        # Fetch all the results as a list of project instances
        projects_list = result.scalars().all()  # Using scalars().all() to get the list of Project objects

        # Return the list of projects
        return projects_list
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error in getting projects: {str(e)}")

