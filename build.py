"""Build a static academic homepage from the files edited by Pages CMS."""

import json
import shutil
from html import escape
from pathlib import Path
from string import Template
from urllib.parse import quote, urlsplit

ROOT = Path(__file__).resolve().parent


def text(value):
    return escape(str(value or ""), quote=True)


def link(label, url):
    """CMS links must be ordinary web URLs, never executable protocols."""
    if not url:
        return ""
    parsed = urlsplit(url)
    if parsed.scheme not in ("https", "http") or not parsed.netloc:
        raise ValueError(f"Invalid web link: {url!r}")
    return f'<a href="{text(url)}">{text(label)}</a>'


def paragraphs(value):
    return "".join(f"<p>{text(p).replace(chr(10), '<br>')}</p>" for p in (value or "").split("\n\n") if p.strip())


def items(data, empty, render):
    return "".join(render(item) for item in data.get("items", [])) or f'<p class="empty">{empty}</p>'


def dated_entry(period, body):
    return f'<div class="entry dated-entry"><div class="date">{text(period)}</div><div>{body}</div></div>'


def render_news(item):
    body = paragraphs(item.get("text")) + link("Read more", item.get("url"))
    return dated_entry(item.get("date"), body)


def render_education(item):
    body = f'<h3>{text(item.get("institution"))}</h3><p>{text(item.get("degree"))}</p><p class="details">{text(item.get("details"))}</p>'
    return dated_entry(item.get("period"), body)


def render_project(item):
    links = link("Project", item.get("url")) + link("Code", item.get("code"))
    body = f'<h3>{text(item.get("title"))}</h3>{paragraphs(item.get("description"))}<div class="entry-links">{links}</div>'
    return dated_entry(item.get("period"), body)


def render_publication(item):
    title = link(item.get("title"), item.get("paper")) or text(item.get("title"))
    links = link("Paper", item.get("paper")) + link("Code", item.get("code")) + link("Project", item.get("project"))
    return f'<article class="entry"><h3>{title}</h3><p>{text(item.get("authors"))}</p><p class="details">{text(item.get("venue"))}</p><div class="entry-links">{links}</div></article>'


def render_award(item):
    return dated_entry(item.get("year"), f'<h3>{text(item.get("title"))}</h3><p class="details">{text(item.get("organization"))}</p>')


def render(data):
    profile = data["profile"]
    photo = profile.get("photo")
    portrait = '<div class="portrait portrait-placeholder" role="img" aria-label="Profile photo to be added"><span>TW</span><small>Photo to come</small></div>'
    if photo:
        # The CMS uploads to /media. Reject outside paths and missing uploads.
        relative = Path(photo.lstrip("/"))
        if not photo.startswith("/media/") or ".." in relative.parts or not (ROOT / relative).is_file():
            raise ValueError("Profile photo must be an existing upload in /media/.")
        portrait = f'<img class="portrait" src="{text(photo)}" alt="{text(profile["name"])}" width="138" height="168">'
    values = {key: text(profile.get(key)) for key in ("name", "chinese_name", "role", "institution", "email")}
    values.update(
        description=text(f'{profile["name"]} — {profile["role"]} at {profile["institution"]}. Research interests: {", ".join(profile.get("interests", []))}.'),
        email_url="mailto:" + text(quote(profile["email"], safe="@.+-_")),
        github_link=link("GitHub", profile.get("github")),
        portrait=portrait,
        biography=paragraphs(profile.get("biography")),
        interests="".join(f"<li>{text(interest)}</li>" for interest in profile.get("interests", [])),
        news=items(data["news"], "Updates will appear here.", render_news),
        education=items(data["education"], "To be added.", render_education),
        projects=items(data["projects"], "To be added.", render_project),
        publications=items(data["publications"], "To be added.", render_publication),
        awards=items(data["awards"], "To be added.", render_award),
    )
    return Template((ROOT / "templates/index.html").read_text()).substitute(values)


def build():
    data = {name: json.loads((ROOT / f"content/{name}.json").read_text()) for name in ("profile", "news", "education", "projects", "publications", "awards")}
    html = render(data)
    output = ROOT / "dist"
    output.mkdir(exist_ok=True)
    (output / "index.html").write_text(html)
    shutil.copytree(ROOT / "assets", output / "assets", dirs_exist_ok=True)
    shutil.copytree(ROOT / "media", output / "media", dirs_exist_ok=True)
    (output / ".nojekyll").touch()
    print("Built dist/index.html")


if __name__ == "__main__":
    build()
