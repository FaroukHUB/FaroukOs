from pydantic import BaseModel, ConfigDict


class AssigneeLabelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    key: str
    label: str


class AssigneeLabelUpdate(BaseModel):
    label: str
