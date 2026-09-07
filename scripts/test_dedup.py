"""Focused regression for canonical priority, source retention and input integrity."""
import copy
import unittest
from publish_gallery import deduplicate

class DedupTests(unittest.TestCase):
 def setUp(self):
  self.items=[{'id':'web-a','origin':'web','category':'局部强调'},{'id':'hf-a','origin':'official','category':'局部强调'},{'id':'distinct','origin':'remotion','category':'字幕'}]
  self.rules={'groups':[{'key':'a','members':['web-a','hf-a'],'reason':'same action'}]}
 def test_official_wins_regardless_of_input_order(self):
  before=copy.deepcopy(self.items);out,redirects=deduplicate(self.items,self.rules)
  self.assertEqual([e['id'] for e in out],['hf-a','distinct']);self.assertEqual(redirects,{'web-a':'hf-a'})
  self.assertEqual(out[0]['alternatives'][0]['id'],'web-a');self.assertEqual(self.items,before)
 def test_no_name_based_merge(self):
  for e in self.items:e['title']='Same name'
  out,_=deduplicate(self.items,{'groups':[]});self.assertEqual(len(out),3)
 def test_missing_member_rejected(self):
  self.rules['groups'][0]['members'].append('missing')
  with self.assertRaises(ValueError):deduplicate(self.items,self.rules)
 def test_cross_category_rejected(self):
  self.rules['groups'][0]['members'].append('distinct')
  with self.assertRaises(ValueError):deduplicate(self.items,self.rules)
 def test_overlap_rejected(self):
  self.rules['groups'].append(self.rules['groups'][0])
  with self.assertRaises(ValueError):deduplicate(self.items,self.rules)

if __name__=='__main__':unittest.main()
