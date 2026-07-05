from datetime import date

from pydantic import BaseModel

from app.models.enums import Assignee


class WorkflowItemOut(BaseModel):
    title: str
    category_name: str | None
    minutes: int


class WorkflowOut(BaseModel):
    name: str
    items: list[WorkflowItemOut]


class ApplyWorkflowRequest(BaseModel):
    company_id: int
    workflow_name: str
    planned_date: date
    block_id: int | None = None
    assignee: Assignee = Assignee.MOI
