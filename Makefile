# My Closet 로컬 구동 명령어.

SHELL := /bin/bash
.DEFAULT_GOAL := help

ifneq (,$(wildcard .env))
include .env
export
endif

PNPM    ?= pnpm
FLUTTER ?= flutter
MOBILE_DIR := apps/mobile

API_BASE_URL ?= http://localhost:3000
APP_ENV      ?= dev
SMS_DEV_MODE ?= true
export SMS_DEV_MODE

.PHONY: help local-install local-prisma-migrate local-api-dev local-mobile-run

help:
	@echo "로컬 구동 순서. (DB는 Supabase dev 프로젝트 사용 — docs/tech-stack.md §4)"
	@echo "  1) make local-install         의존성 설치 (최초 1회)"
	@echo "  2) make local-prisma-migrate  Supabase dev 스키마 마이그레이션 적용"
	@echo "  3) make local-api-dev         NestJS API (SMS_DEV_MODE=true 자동 적용)"
	@echo "  4) make local-mobile-run      Flutter 앱 (API_BASE_URL=$(API_BASE_URL) 자동 주입)"
	@echo ""
	@echo "  Android 에뮬레이터는 make local-mobile-run API_BASE_URL=http://10.0.2.2:3000"

local-install:
	$(PNPM) install
	$(PNPM) prisma:generate
	cd $(MOBILE_DIR) && $(FLUTTER) pub get

local-prisma-migrate:
	$(PNPM) prisma:migrate

local-api-dev:
	$(PNPM) api:dev

local-mobile-run:
	cd $(MOBILE_DIR) && $(FLUTTER) run --dart-define=API_BASE_URL=$(API_BASE_URL) --dart-define=APP_ENV=$(APP_ENV)
