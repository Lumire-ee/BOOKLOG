import { Link } from "react-router-dom";
import { CONTACT_EMAIL } from "@/shared/constants/contact";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-bg-base min-h-screen w-full px-4 py-6 md:px-6 md:py-8">
      <article className="border-border-default bg-bg-surface text-text-secondary mx-auto w-full max-w-4xl space-y-8 rounded-xl border p-5 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <h1 className="typo-heading-md text-text-primary">
            개인정보 처리방침
          </h1>
          <Link
            to="/"
            className="typo-label-sm hover:text-text-primary underline underline-offset-4"
          >
            홈으로
          </Link>
        </div>

        <section className="space-y-3">
          <p className="typo-body-sm">
            BookLog(이하 &quot;서비스&quot;)는 개인정보 보호법 등 관련 법령을
            준수하며, 이용자의 개인정보를 보호하기 위해 아래와 같이 개인정보
            처리방침을 수립·공개합니다.
          </p>
          <ul className="typo-body-sm list-disc space-y-1 pl-5">
            <li>공고일: 2026년 4월 9일</li>
            <li>시행일: 2026년 4월 10일</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="typo-heading-sm text-text-primary">
            1. 개인정보의 처리 목적
          </h2>
          <p className="typo-body-sm">
            서비스는 다음의 목적을 위하여 개인정보를 처리합니다.
          </p>
          <ul className="typo-body-sm list-disc space-y-1 pl-5">
            <li>회원 가입 및 본인 식별·인증(이메일 로그인, 소셜 로그인)</li>
            <li>도서 검색 및 독서 기록 서비스 제공</li>
            <li>프로필 관리(닉네임, 프로필 이미지)</li>
            <li>서비스 운영, 보안, 오류 대응, 부정 이용 방지</li>
            <li>이용자 문의 응대 및 분쟁 처리</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="typo-heading-sm text-text-primary">
            2. 처리하는 개인정보의 항목
          </h2>
          <p className="typo-body-sm">
            서비스는 다음과 같은 개인정보를 처리합니다.
          </p>
          <ul className="typo-body-sm list-disc space-y-1 pl-5">
            <li>회원가입/로그인: 이메일 주소, 인증 수단 정보</li>
            <li>
              소셜 로그인 이용 시: OAuth 제공자 식별정보, 이메일, 프로필 정보
              (제공 범위 내)
            </li>
            <li>
              서비스 이용 정보: 도서 메타데이터(ISBN, 제목, 저자, 출판사 등),
              독서 상태, 시작·종료일, 현재 페이지, 평점, 메모
            </li>
            <li>프로필 정보: 닉네임, 프로필 이미지</li>
            <li>
              자동 수집 정보: 접속 IP/브라우저 정보, 서비스 이용 기록, 브라우저
              저장소(localStorage/sessionStorage) 정보
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="typo-heading-sm text-text-primary">
            3. 개인정보 수집 방법
          </h2>
          <p className="typo-body-sm">
            서비스는 다음과 같은 방법으로 개인정보를 수집합니다.
          </p>
          <ul className="typo-body-sm list-disc space-y-1 pl-5">
            <li>이용자가 서비스 화면에서 직접 입력</li>
            <li>소셜 로그인 과정에서 이용자의 동의를 통해 제공받는 정보</li>
            <li>서비스 이용 과정에서 자동 생성·수집</li>
            <li>도서 검색 시 이용자가 입력한 검색어 처리</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="typo-heading-sm text-text-primary">
            4. 개인정보의 보유 및 이용 기간
          </h2>
          <p className="typo-body-sm">
            서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
            개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
            개인정보를 처리합니다.
          </p>
          <ul className="typo-body-sm list-disc space-y-1 pl-5">
            <li>회원정보 및 독서기록: 회원 탈퇴 시까지</li>
            <li>부정 이용 방지를 위한 최소 로그: 탈퇴 후 최대 1년</li>
            <li>법령에 따른 보존 의무가 있는 경우: 관련 법령에서 정한 기간</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="typo-heading-sm text-text-primary">
            5. 개인정보의 파기 절차 및 방법
          </h2>
          <p className="typo-body-sm">
            서비스는 개인정보 보유기간의 경과, 처리 목적 달성 등 개인정보가
            불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
          </p>
          <ul className="typo-body-sm list-disc space-y-1 pl-5">
            <li>
              전자적 파일 형태의 정보는 복구 및 재생이 불가능한 기술적 방법을
              사용하여 삭제합니다.
            </li>
            <li>
              종이에 출력된 개인정보는 분쇄하거나 소각을 통하여 파기합니다.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="typo-heading-sm text-text-primary">
            6. 개인정보의 처리위탁
          </h2>
          <p className="typo-body-sm">
            서비스는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보
            처리업무를 위탁하고 있습니다.
          </p>
          <div className="overflow-x-auto">
            <table className="typo-body-sm border-border-default w-full min-w-[520px] border text-left">
              <thead className="bg-bg-surface-subtitle/20">
                <tr>
                  <th className="border-border-default border px-2 py-2">
                    수탁사/제공처
                  </th>
                  <th className="border-border-default border px-2 py-2">
                    처리 목적
                  </th>
                  <th className="border-border-default border px-2 py-2">
                    처리 항목
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-border-default border px-2 py-2">
                    Supabase, Inc.
                  </td>
                  <td className="border-border-default border px-2 py-2">
                    인증, 데이터베이스/스토리지 운영
                  </td>
                  <td className="border-border-default border px-2 py-2">
                    회원정보, 서비스 이용 데이터
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="typo-body-sm">
            서비스는 위탁계약 체결 시 「개인정보 보호법」 제 26조에 따라
            위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치,
            재위탁 제한, 수탁자에 대한 관리·감독 등을 계약서 등 문서에 명시하고
            있습니다.
          </p>
          <p className="typo-body-sm">
            도서 검색 시 Google Books API 및 Kakao 검색 API로의 검색어 전송은
            처리위탁이 아닌 제3자 제공 항목에 해당합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="typo-heading-sm text-text-primary">
            7. 개인정보의 제3자 제공
          </h2>
          <p className="typo-body-sm">
            서비스는 이용자의 개인정보를 원칙적으로 외부에 공개하지 않습니다.
            다만, 다음의 경우에는 예외로 합니다.
          </p>
          <ul className="typo-body-sm list-disc space-y-1 pl-5">
            <li>이용자가 사전에 동의한 경우</li>
            <li>
              법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와
              방법에 따라 수사기관의 요구가 있는 경우
            </li>
            <li>
              이용자가 도서 검색 기능을 사용할 경우, 검색어가 Google Books API
              및 Kakao 검색 API로 전송될 수 있는 경우
            </li>
          </ul>
          <p className="typo-body-sm">
            위 전송은 이용자 요청에 따른 검색 결과 제공 목적에서만 처리됩니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="typo-heading-sm text-text-primary">
            8. 개인정보의 국외 이전
          </h2>
          <p className="typo-body-sm">
            서비스는 서비스의 제공을 위하여 아래와 같이 개인정보를 국외로
            이전하고 있습니다.
          </p>
          <ul className="typo-body-sm list-disc space-y-1 pl-5">
            <li>이전받는 자: Supabase, Inc.</li>
            <li>이전 국가: 미국</li>
            <li>이전 항목: 회원정보 및 서비스 이용 데이터</li>
            <li>이전 목적: 인증 및 데이터 저장</li>
            <li>이전 시점 및 방법: 서비스 이용 시 네트워크를 통한 전송</li>
            <li>
              도서 검색 시 Google LLC(미국 등)에 검색어가 이전될 수 있습니다.
            </li>
            <li>
              Google/Kakao 소셜 로그인 사용 시 각 OAuth 제공자 정책에 따라 인증
              관련 정보가 국외 이전될 수 있습니다.
            </li>
          </ul>
          <p className="typo-body-sm">
            이용자는 개인정보의 국외 이전을 거부할 권리가 있으며, 거부 시 서비스
            이용이 제한될 수 있습니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="typo-heading-sm text-text-primary">
            9. 정보주체와 법정대리인의 권리·의무 및 행사 방법
          </h2>
          <p className="typo-body-sm">
            이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다.
          </p>
          <ul className="typo-body-sm list-disc space-y-1 pl-5">
            <li>개인정보 열람 요구</li>
            <li>오류 등이 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리정지 요구</li>
            <li>동의 철회 및 회원 탈퇴</li>
          </ul>
          <p className="typo-body-sm">
            권리 행사는 서비스 내 기능 또는 문의를 통해 요청할 수 있으며,
            서비스는 지체 없이 조치합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="typo-heading-sm text-text-primary">
            10. 개인정보의 안정성 확보조치
          </h2>
          <p className="typo-body-sm">
            서비스는 개인정보의 안정성 확보를 위하여 다음과 같은 조치를 취하고
            있습니다.
          </p>
          <ul className="typo-body-sm list-disc space-y-1 pl-5">
            <li>접근 권한의 최소화 및 접근 통제</li>
            <li>전송 구간 암호화(HTTPS/TLS)</li>
            <li>인증정보 및 비밀번호의 분리 보관</li>
            <li>로그 기록 및 보안 점검</li>
            <li>독서 메모(notes) 서버 측 암호화 저장</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="typo-heading-sm text-text-primary">
            11. 쿠키 및 로컬 저장소의 운영
          </h2>
          <p className="typo-body-sm">
            서비스는 로그인 상태 유지 및 보안 처리를 위해 브라우저 저장소
            (sessionStorage/localStorage)를 사용할 수 있습니다.
          </p>
          <ul className="typo-body-sm list-disc space-y-1 pl-5">
            <li>
              계정 삭제 재인증 흐름 처리 상태는 sessionStorage에 저장되며 최대
              5분 보관 후 만료 또는 삭제됩니다.
            </li>
            <li>
              브라우저 설정에서 저장 데이터 삭제 또는 차단이 가능하며, 일부 기능
              이용이 제한될 수 있습니다.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="typo-heading-sm text-text-primary">
            12. 개인정보 보호책임자 및 문의처
          </h2>
          <ul className="typo-body-sm list-disc space-y-1 pl-5">
            <li>담당자: BookLog 운영자</li>
            <li>
              이메일:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="hover:text-text-primary underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
          <p className="typo-body-sm">
            서비스는 개인정보 처리와 관련한 이용자의 문의에 대해 신속하고
            성실하게 답변드립니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="typo-heading-sm text-text-primary">
            13. 권익침해 구제방법
          </h2>
          <p className="typo-body-sm">
            이용자는 개인정보 침해에 대한 피해구제, 상담 등을 아래 기관에 문의할
            수 있습니다.
          </p>
          <ul className="typo-body-sm list-disc space-y-1 pl-5">
            <li>개인정보침해신고센터: 118 / (www.1336.or.kr / 1336)</li>
            <li>
              개인정보분쟁조정위원회: 1833-6972 / (https://www.kipico.go.kr)
            </li>
            <li>대검찰청: 1301 / (www.spo.go.kr / 1301)</li>
            <li>경찰청: 182 / (www.police.go.kr / 182)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="typo-heading-sm text-text-primary">
            14. 개인정보 처리방침 변경
          </h2>
          <p className="typo-body-sm">
            본 개인정보 처리방침은 법령 및 서비스 정책에 따라 변경될 수 있으며,
            변경 시에는 사전에 공지합니다.
          </p>
          <p className="typo-body-sm">
            본 방침은 2026년 4월 10일부터 시행됩니다.
          </p>
        </section>
      </article>
    </div>
  );
}
