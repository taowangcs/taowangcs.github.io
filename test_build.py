"""Verify future CMS edits, empty sections, and safe HTML output."""

import copy
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import build


class HomepageTests(unittest.TestCase):
    def setUp(self):
        # Fixtures stay independent of live content so normal CMS edits keep passing.
        self.data = {name: {"items": []} for name in ("news", "education", "projects", "publications", "awards")}
        self.data["profile"] = {
            "name": "Tao Wang", "chinese_name": "王韬", "role": "Student",
            "institution": "Example University", "email": "taowangcse@gmail.com",
            "photo": "", "biography": "First paragraph.\n\nSecond paragraph.",
            "interests": ["Human Mesh Recovery"], "github": "https://github.com/taowangcs",
        }
        self.data["education"]["items"] = [{"period": "Starting 2027", "degree": "Incoming Ph.D. Student", "institution": "Example University"}]

    def test_initial_content_and_empty_sections(self):
        html = build.render(self.data)
        self.assertIn("Incoming Ph.D. Student", html)
        self.assertIn("Starting 2027", html)
        self.assertIn("mailto:taowangcse@gmail.com", html)
        self.assertEqual(html.count('class="empty"'), 4)
        self.assertNotIn("$biography", html)

    def test_new_cms_entries_and_plain_text_are_rendered(self):
        data = copy.deepcopy(self.data)
        data["news"]["items"] = [{"date": "Oct. 2026", "text": "A <script>alert(1)</script> & B", "url": "https://example.com/news"}]
        data["projects"]["items"] = [{"title": "Test project", "description": "First paragraph.\n\nSecond paragraph.", "code": "https://example.com/code"}]
        data["publications"]["items"] = [{"title": "Test paper", "authors": "Tao Wang et al.", "venue": "Preprint", "paper": "https://example.com/paper"}]
        data["awards"]["items"] = [{"year": "2026", "title": "Test award", "organization": "Test institution"}]
        html = build.render(data)
        self.assertNotIn('class="empty"', html)
        self.assertNotIn("<script>", html)
        for expected in ("&lt;script&gt;", "Test project", "Test paper", "Test award", '<p>Second paragraph.</p>', 'href="https://example.com/code"'):
            self.assertIn(expected, html)
        data["news"]["items"][0]["url"] = "javascript:alert(1)"
        with self.assertRaises(ValueError):
            build.render(data)

    def test_uploaded_photo_replaces_placeholder(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / "media").mkdir()
            (root / "media/portrait.jpg").write_bytes(b"test image fixture")
            (root / "templates").mkdir()
            (root / "templates/index.html").write_text((build.ROOT / "templates/index.html").read_text())
            self.data["profile"]["photo"] = "/media/portrait.jpg"
            with patch.object(build, "ROOT", root):
                html = build.render(self.data)
                self.assertIn('src="/media/portrait.jpg"', html)
                self.assertNotIn("Photo to come", html)
                self.data["profile"]["photo"] = "/media/../private.jpg"
                with self.assertRaises(ValueError):
                    build.render(self.data)


if __name__ == "__main__":
    unittest.main()
