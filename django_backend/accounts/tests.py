
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase


class AuthenticationTests(APITestCase):
    def setUp(self):
        self.register_url = "/api/auth/register/"
        self.login_url = "/api/auth/login/"
        self.profile_url = "/api/auth/profile/"

        self.user_data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "TestPass@123",
        }

    def test_user_registration(self):
        response = self.client.post(
            self.register_url,
            self.user_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        user = User.objects.get(username="testuser")

        self.assertTrue(
            user.check_password("TestPass@123")
        )

    def test_duplicate_username_registration(self):
        User.objects.create_user(
            username="testuser",
            email="first@example.com",
            password="TestPass@123",
        )

        response = self.client.post(
            self.register_url,
            self.user_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_login_returns_jwt_tokens(self):
        User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="TestPass@123",
        )

        response = self.client.post(
            self.login_url,
            {
                "username": "testuser",
                "password": "TestPass@123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_rejects_wrong_password(self):
        User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="TestPass@123",
        )

        response = self.client.post(
            self.login_url,
            {
                "username": "testuser",
                "password": "WrongPassword@123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_profile_requires_authentication(self):
        response = self.client.get(self.profile_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_view_profile(self):
        user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="TestPass@123",
        )

        self.client.force_authenticate(user=user)

        response = self.client.get(self.profile_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(response.data["username"], "testuser")
        self.assertEqual(
            response.data["email"],
            "testuser@example.com",
        )
