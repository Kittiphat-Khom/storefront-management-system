from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.accounts.serializers import FlexibleTokenObtainPairSerializer, RegisterSerializer, UserSerializer


class FlexibleTokenObtainPairView(TokenObtainPairView):
    serializer_class = FlexibleTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

