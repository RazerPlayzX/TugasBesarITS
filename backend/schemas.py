from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator


class Input(BaseModel):
    model_config = ConfigDict(extra='forbid')


class Credentials(Input):
    email: str = Field(min_length=3, max_length=254, pattern=r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
    password: str = Field(min_length=10, max_length=128)

    @field_validator('email')
    @classmethod
    def normalize_email(cls, value):
        return value.lower()


class Registration(Credentials):
    name: str = Field(min_length=1, max_length=80)

    @field_validator('name')
    @classmethod
    def clean_name(cls, value):
        if not value.strip():
            raise ValueError('Nama wajib diisi.')
        return value.strip()


class Recommendation(Input):
    topic: str = Field(min_length=1, max_length=300)
    ability: Literal['Beginner', 'Intermediate', 'Advanced']
    score: float = Field(ge=0, le=100, strict=True, allow_inf_nan=False)
    limit: int = Field(default=5, ge=1, le=20, strict=True)

    @field_validator('topic')
    @classmethod
    def clean_topic(cls, value):
        if not value.strip():
            raise ValueError('Topik wajib diisi.')
        return value.strip()


class QuestRequest(Input):
    recommendation_id: str
    course_ids: list[str] = Field(min_length=1, max_length=20)
    replace: bool = False


class Completion(Input):
    quest_id: str
    course_id: str
    score: float = Field(ge=0, le=100, strict=True, allow_inf_nan=False)


class Course(BaseModel):
    course_id: str
    title: str
    difficulty: str
    url: str
    provider: str | None = None
    description: str | None = None
    rating: str | float | None = None
    cosine_similarity: float


class Adaptation(BaseModel):
    quest_type: str
    target_level: str


class RecommendationResult(BaseModel):
    mode: Literal['model']
    request: Recommendation
    adaptation: Adaptation
    courses: list[Course]
    status: Literal['success', 'empty']
    message: str
    recommendation_id: str


class Quest(Adaptation):
    id: str
    topic: str
    courses: list[Course]


class Profile(BaseModel):
    xp: int
    badges: list[str]
    completedIds: list[str]
    level: int


class Progress(BaseModel):
    total: int
    completed: int
    percent: float


class History(BaseModel):
    course_id: str
    title: str
    topic: str
    score: float
    xp: int
    badges: list[str]


class State(BaseModel):
    schema_version: int
    quest: Quest | None
    history: list[History]
    profile: Profile
    progress: Progress


class CompletionResult(BaseModel):
    state: State
    duplicate: bool
    status: Literal['completed', 'already_completed']
    xp_awarded: int
    total_xp: int
    level_before: int
    level_after: int
    new_badges: list[str]
    progress: Progress
