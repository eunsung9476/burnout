// 데이터 레코드 타입 정의

export interface SchoolRecord {
  학교명: string;
  시도: string;
  학교급: string;
  지역규모?: string;
  행정구?: string;
  위도: number;
  경도: number;
  학생수: number;
  교원수: number;
  교원1인당학생수: number;
  기간제비율: number;
  정규교원비율: number;
  과밀score: number;
  소멸score: number;
  기간제score: number;
  과밀등급: string;
  소멸등급: string;
  기간제등급: string;
  // 계산 필드 (클라이언트에서 추가)
  종합위험지수?: number;
  위험등급명?: string;
  _map_size?: number;
  군집?: string;
  [key: string]: string | number | null | undefined;
}

export type WideRecord = {
  학교명: string;
  시도: string;
  학교급: string;
  [key: string]: string | number | null;
};

export interface DataResponse {
  ok: boolean;
  error?: string;
  schools: SchoolRecord[];
}

export interface WideResponse {
  ok: boolean;
  error?: string;
  rows: WideRecord[];
}
